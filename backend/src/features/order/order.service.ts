import { Prisma } from '../../generated/prisma/client'
import type { OrderStatus } from '../../generated/prisma/client'
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination'
import { AppError } from '../../shared/AppError'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import {
  findMaxOrderNumber,
  insertOrder,
  findOrdersPage,
  countOrders,
  findOrderById,
  findOrderWithDetails,
  updateOrderWithItems,
  deleteOrderById,
} from './order.model'
import { findClientById } from '../client/client.model'
import type { CreateOrderInput, UpdateOrderInput, ListOrdersFilters, OrderItemInput } from './order.types'

const MAX_NUMBER_ATTEMPTS = 3

function computeItemsTotal(items: OrderItemInput[]) {
  return items.reduce(
    (total, item) => total.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity ?? 1)),
    new Prisma.Decimal(0),
  )
}

function toItemsData(items: OrderItemInput[]) {
  return items.map((item) => ({
    product: item.product,
    description: item.description,
    quantity: item.quantity ?? 1,
    unitPrice: item.unitPrice,
  }))
}

async function assertClientExists(businessId: string, clientId: string) {
  const client = await findClientById(businessId, clientId)

  if (!client) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }

  return client
}

async function assertOrderExists(businessId: string, orderId: string) {
  const order = await findOrderById(businessId, orderId)

  if (!order) {
    throw new AppError('Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }

  return order
}

async function insertOrderWithNumber(
  businessId: string,
  buildData: (number: number) => Prisma.OrderUncheckedCreateInput,
) {
  for (let attempt = 1; attempt <= MAX_NUMBER_ATTEMPTS; attempt += 1) {
    const nextNumber = (await findMaxOrderNumber(businessId)) + 1

    try {
      return await insertOrder(buildData(nextNumber))
    } catch (error) {
      const duplicatedFields = getUniqueViolationFields(error)
      const isNumberRace = duplicatedFields?.some((field) => field.includes('number'))

      if (!isNumberRace) throw error
      if (attempt === MAX_NUMBER_ATTEMPTS) break
    }
  }

  throw new AppError(
    'No se ha podido asignar el número de pedido, inténtalo de nuevo',
    409,
    'ORDER_NUMBER_CONFLICT',
  )
}

export async function createOrder(
  businessId: string,
  userId: string | undefined,
  input: CreateOrderInput,
) {
  await assertClientExists(businessId, input.clientId)

  const price = computeItemsTotal(input.items)

  return insertOrderWithNumber(businessId, (number) => ({
    businessId,
    clientId: input.clientId,
    number,
    channel: input.channel ?? undefined,
    kind: input.kind ?? undefined,
    price,
    address: input.address,
    zone: input.zone,
    latitude: input.latitude,
    longitude: input.longitude,
    expectedDate: input.expectedDate,
    description: input.description,
    notes: input.notes,
    createdBy: userId,
    items: { create: toItemsData(input.items) },
    statusHistory: { create: { status: 'PENDING', changedBy: userId } },
  }))
}

function buildCreatedAtRange(
  dateFrom?: string,
  dateTo?: string,
): Prisma.DateTimeFilter | undefined {
  const range: Prisma.DateTimeFilter = {}

  if (dateFrom) {
    const gte = new Date(dateFrom)
    if (!Number.isNaN(gte.getTime())) range.gte = gte
  }

  if (dateTo) {
    const lte = new Date(dateTo)
    if (!Number.isNaN(lte.getTime())) range.lte = lte
  }

  return Object.keys(range).length > 0 ? range : undefined
}

export async function listOrders(businessId: string, filters: ListOrdersFilters) {
  const { page, limit, skip } = parsePagination(filters)
  const createdAtRange = buildCreatedAtRange(filters.dateFrom, filters.dateTo)

  const where: Prisma.OrderWhereInput = {
    businessId,
    ...(filters.status && { status: filters.status }),
    ...(filters.channel && { channel: filters.channel }),
    ...(createdAtRange && { createdAt: createdAtRange }),
  }

  const [data, total] = await Promise.all([findOrdersPage(where, skip, limit), countOrders(where)])

  return buildPaginatedResponse(data, total, page, limit)
}

export async function getOrderById(businessId: string, orderId: string) {
  return findOrderWithDetails(businessId, orderId)
}

const FINAL_STATUSES = new Set<OrderStatus>(['DELIVERED', 'CANCELLED'])

function assertValidStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  if (nextStatus === currentStatus) return

  if (FINAL_STATUSES.has(currentStatus)) {
    throw new AppError(
      `El pedido ya está en un estado final (${currentStatus}) y no se puede cambiar`,
      400,
      'ORDER_STATUS_FINAL',
    )
  }
}

export async function updateOrder(
  businessId: string,
  userId: string | undefined,
  orderId: string,
  input: UpdateOrderInput,
) {
  const existing = await assertOrderExists(businessId, orderId)

  if (input.status !== undefined) {
    assertValidStatusTransition(existing.status, input.status)
  }

  const items = input.items ? toItemsData(input.items) : undefined

  const data: Prisma.OrderUpdateInput = {
    ...(input.channel !== undefined && { channel: input.channel }),
    ...(input.kind !== undefined && { kind: input.kind }),
    ...(input.address !== undefined && { address: input.address }),
    ...(input.zone !== undefined && { zone: input.zone }),
    ...(input.latitude !== undefined && { latitude: input.latitude }),
    ...(input.longitude !== undefined && { longitude: input.longitude }),
    ...(input.expectedDate !== undefined && { expectedDate: input.expectedDate }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.items && { price: computeItemsTotal(input.items) }),
  }

  const statusChange =
    input.status !== undefined && input.status !== existing.status
      ? { status: input.status, changedBy: userId }
      : undefined

  return updateOrderWithItems(orderId, data, items, statusChange)
}

export async function deleteOrder(businessId: string, orderId: string) {
  await assertOrderExists(businessId, orderId)

  await deleteOrderById(orderId)
}

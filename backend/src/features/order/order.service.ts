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
  countOrdersByStatus,
  findOrderById,
  findOrderWithDetails,
  updateOrderWithItems,
  deleteOrderById,
  findActiveOrderTag,
  insertOrderTag,
  markOrderTagRemoved,
} from './order.model'
import { findClientById } from '../client/client.model'
import { findTagById } from '../tag/tag.model'
import { findBusinessCountry } from '../auth/auth.model'
import { geocodeAddress } from '../../shared/services/geocoding.service'
import type { GeocodedLocation } from '../../shared/services/geocoding.service'
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

interface OrderItemsSummaryInput {
  description: string | null
  items: { product: string; quantity: number }[]
}

// An order's own description, when set, is a general summary of the whole order.
// Without one, fall back to a summary built from its items (e.g. "Chaqueta oversize x2, Bolso de piel").
export function resolveOrderDescription(order: OrderItemsSummaryInput): string | null {
  if (order.description) return order.description

  if (order.items.length === 0) return null

  return order.items
    .map((item) => (item.quantity > 1 ? `${item.product} x${item.quantity}` : item.product))
    .join(', ')
}

function mapOrderRow<Row extends OrderItemsSummaryInput>(order: Row) {
  const { items, ...rest } = order
  return { ...rest, description: resolveOrderDescription(order) }
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

async function geocodeOrderLocation(
  businessId: string,
  address?: string | null,
  zone?: string | null,
): Promise<GeocodedLocation | null> {
  if (!address?.trim() && !zone?.trim()) return null

  const countryCode = await findBusinessCountry(businessId)

  return geocodeAddress({ address, zone, countryCode: countryCode ?? undefined })
}

// An order only gets its own coordinates when it has its own address/zone, explicit or geocoded.
// Without either, it has none of its own — order-map.service falls back to the client's location.
async function locateOrder(
  businessId: string,
  input: { address?: string | null; zone?: string | null; latitude?: number; longitude?: number },
): Promise<GeocodedLocation | null> {
  if (input.latitude !== undefined && input.longitude !== undefined) {
    return { latitude: input.latitude, longitude: input.longitude }
  }

  return geocodeOrderLocation(businessId, input.address, input.zone)
}

function hasTextChanged(newValue: string | null | undefined, currentValue: string | null): boolean {
  return newValue !== undefined && (newValue?.trim() || null) !== (currentValue?.trim() || null)
}

async function relocateOrder(
  businessId: string,
  existing: { address: string | null; zone: string | null },
  input: UpdateOrderInput,
): Promise<GeocodedLocation | null> {
  if (input.latitude !== undefined && input.longitude !== undefined) return null

  const addressChanged = hasTextChanged(input.address, existing.address)
  const zoneChanged = hasTextChanged(input.zone, existing.zone)
  if (!addressChanged && !zoneChanged) return null

  return geocodeOrderLocation(
    businessId,
    input.address === undefined ? existing.address : input.address,
    input.zone === undefined ? existing.zone : input.zone,
  )
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
  const location = await locateOrder(businessId, input)

  return insertOrderWithNumber(businessId, (number) => ({
    businessId,
    clientId: input.clientId,
    number,
    channel: input.channel ?? undefined,
    kind: input.kind ?? undefined,
    price,
    address: input.address,
    zone: input.zone,
    latitude: location?.latitude,
    longitude: location?.longitude,
    expectedDate: input.expectedDate,
    description: input.description,
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

function buildSearchFilter(search: string): Prisma.OrderWhereInput['OR'] {
  const filters: Prisma.OrderWhereInput[] = [
    { client: { name: { contains: search, mode: 'insensitive' } } },
    { items: { some: { product: { contains: search, mode: 'insensitive' } } } },
  ]

  const number = Number(search)
  if (Number.isInteger(number)) {
    filters.push({ number })
  }

  return filters
}

export async function listOrders(businessId: string, filters: ListOrdersFilters) {
  const { page, limit, skip } = parsePagination(filters)
  const createdAtRange = buildCreatedAtRange(filters.dateFrom, filters.dateTo)

  const where: Prisma.OrderWhereInput = {
    businessId,
    ...(filters.status && { status: filters.status }),
    ...(filters.channel && { channel: filters.channel }),
    ...(createdAtRange && { createdAt: createdAtRange }),
    ...(filters.search && { OR: buildSearchFilter(filters.search) }),
  }

  const [data, total, statusGroups] = await Promise.all([
    findOrdersPage(where, skip, limit),
    countOrders(where),
    countOrdersByStatus(businessId),
  ])

  return {
    ...buildPaginatedResponse(data.map(mapOrderRow), total, page, limit),
    statusCounts: buildStatusCounts(statusGroups),
  }
}

const ALL_ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function buildStatusCounts(
  groups: { status: OrderStatus; _count: number }[],
): Record<OrderStatus, number> {
  const counts = Object.fromEntries(
    ALL_ORDER_STATUSES.map((status) => [status, 0]),
  ) as Record<OrderStatus, number>

  for (const group of groups) {
    counts[group.status] = group._count
  }

  return counts
}

export async function getOrderById(businessId: string, orderId: string) {
  const order = await findOrderWithDetails(businessId, orderId)
  if (!order) return null

  return { ...order, description: resolveOrderDescription(order) }
}

const FINAL_STATUSES = new Set<OrderStatus>(['DELIVERED', 'CANCELLED'])

// Once in a final status, the order can still be reopened into the normal flow — to
// correct a mistake, e.g. marked DELIVERED/CANCELLED too soon — but never swapped directly
// into the *other* final status without passing back through the open flow first.
function assertValidStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  if (nextStatus === currentStatus) return

  if (FINAL_STATUSES.has(currentStatus) && FINAL_STATUSES.has(nextStatus)) {
    throw new AppError(
      `El pedido ya está en un estado final (${currentStatus}) y no se puede cambiar directamente a otro estado final`,
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
  const location = await relocateOrder(businessId, existing, input)

  const data: Prisma.OrderUpdateInput = {
    ...(input.channel !== undefined && { channel: input.channel }),
    ...(input.kind !== undefined && { kind: input.kind }),
    ...(input.address !== undefined && { address: input.address }),
    ...(input.zone !== undefined && { zone: input.zone }),
    ...(input.latitude !== undefined && { latitude: input.latitude }),
    ...(input.longitude !== undefined && { longitude: input.longitude }),
    ...(location && { latitude: location.latitude, longitude: location.longitude }),
    ...(input.expectedDate !== undefined && { expectedDate: input.expectedDate }),
    ...(input.description !== undefined && { description: input.description }),
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

export async function assignTagToOrder(businessId: string, orderId: string, tagId: string) {
  await assertOrderExists(businessId, orderId)

  const tag = await findTagById(businessId, tagId)
  if (!tag) {
    throw new AppError('Etiqueta no encontrada', 404, 'TAG_NOT_FOUND')
  }

  const activeAssignment = await findActiveOrderTag(orderId, tagId)
  if (activeAssignment) {
    throw new AppError('Este pedido ya tiene esa etiqueta', 409, 'TAG_ALREADY_ASSIGNED')
  }

  return insertOrderTag(orderId, tagId)
}

export async function removeTagFromOrder(businessId: string, orderId: string, tagId: string) {
  await assertOrderExists(businessId, orderId)

  const activeAssignment = await findActiveOrderTag(orderId, tagId)
  if (!activeAssignment) {
    throw new AppError('El pedido no tiene esa etiqueta', 404, 'ORDER_TAG_NOT_FOUND')
  }

  await markOrderTagRemoved(activeAssignment.id)
}

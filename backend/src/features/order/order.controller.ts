import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import { assertValidCoordinates } from '../../shared/utils/coordinates'
import { createOrder, listOrders, getOrderById, updateOrder, deleteOrder } from './order.service'
import type { CreateOrderInput, UpdateOrderInput, ListOrdersFilters, OrderItemInput } from './order.types'

const VALID_STATUSES = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isPositiveInteger(value: unknown): value is number {
  return isPositiveNumber(value) && Number.isInteger(value)
}

function assertValidItems(items: unknown): OrderItemInput[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('El pedido debe tener al menos un producto', 400, 'MISSING_ITEMS')
  }

  return items.map((rawItem, index) => {
    const { product, description, quantity, unitPrice } = (rawItem ?? {}) as Record<
      string,
      unknown
    >

    if (typeof product !== 'string' || !product.trim()) {
      throw new AppError(
        `El producto del artículo ${index + 1} es obligatorio`,
        400,
        'MISSING_PRODUCT',
      )
    }

    if (!isPositiveNumber(unitPrice)) {
      throw new AppError(
        `El precio del artículo ${index + 1} es obligatorio y debe ser mayor que 0`,
        400,
        'MISSING_PRICE',
      )
    }

    if (quantity !== undefined && !isPositiveInteger(quantity)) {
      throw new AppError(`La cantidad del artículo ${index + 1} no es válida`, 400, 'INVALID_QUANTITY')
    }

    return {
      product: product.trim(),
      description: typeof description === 'string' ? description.trim() : undefined,
      quantity: quantity as number | undefined,
      unitPrice,
    }
  })
}

function assertValidStatus(status: unknown) {
  if (status !== undefined && !VALID_STATUSES.includes(status as string)) {
    throw new AppError('Estado de pedido no válido', 400, 'INVALID_STATUS')
  }
}

function parseOptionalDate(value: unknown, fieldLabel: string): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null

  const date = new Date(value as string)
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldLabel} no es una fecha válida`, 400, 'INVALID_DATE')
  }

  return date
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { clientId, channel, kind, address, zone, latitude, longitude, description, notes } =
    req.body as CreateOrderInput

  if (typeof clientId !== 'string' || !clientId) {
    throw new AppError('Indica el cliente', 400, 'MISSING_CLIENT')
  }

  const items = assertValidItems(req.body.items)
  assertValidCoordinates(latitude, longitude)
  const expectedDate = parseOptionalDate(req.body.expectedDate, 'La fecha prevista')

  const order = await createOrder(req.businessId!, req.userId, {
    clientId,
    channel,
    kind,
    items,
    address,
    zone,
    latitude,
    longitude,
    description,
    notes,
    expectedDate,
  })

  res.status(201).json({ order })
})

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, channel, dateFrom, dateTo, search } = req.query as ListOrdersFilters

  const result = await listOrders(req.businessId!, {
    page,
    limit,
    status,
    channel,
    dateFrom,
    dateTo,
    search,
  })

  res.json(result)
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.businessId!, req.params.id as string)

  if (!order) {
    throw new AppError('Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }

  res.json({ order })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateOrderInput
  const { channel, kind, address, zone, latitude, longitude, description, notes, status } = body

  const items = req.body.items !== undefined ? assertValidItems(req.body.items) : undefined
  assertValidCoordinates(latitude, longitude)
  assertValidStatus(status)
  const expectedDate = parseOptionalDate(req.body.expectedDate, 'La fecha prevista')

  const order = await updateOrder(req.businessId!, req.userId, req.params.id as string, {
    channel,
    kind,
    items,
    address,
    zone,
    latitude,
    longitude,
    description,
    notes,
    status,
    expectedDate,
  })

  res.json({ order })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteOrder(req.businessId!, req.params.id as string)

  res.status(204).send()
})

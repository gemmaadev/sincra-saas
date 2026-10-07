import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { create, list, getById, update, remove } from './order.controller'
import * as orderService from './order.service'
import { AppError } from '../../shared/AppError'

function createMockRequest(overrides: Record<string, unknown> = {}): Request {
  return overrides as unknown as Request
}

function createMockResponse() {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  return res
}

const validItems = [{ product: 'Camiseta', unitPrice: 15 }]

describe('create', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a client id and at least one valid item
  // When creating an order
  // Then it should call the service with the business, the user and the body, and respond 201
  it('creates the order and responds 201 with it', async () => {
    const createSpy = vi
      .spyOn(orderService, 'createOrder')
      .mockResolvedValue({ id: 'order-1' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      body: { clientId: 'client-1', items: validItems },
    })
    const res = createMockResponse()

    await create(req, res, vi.fn() as NextFunction)

    expect(createSpy).toHaveBeenCalledWith(
      'biz-1',
      'user-1',
      expect.objectContaining({ clientId: 'client-1', items: validItems }),
    )
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ order: { id: 'order-1' } })
  })

  // Given a request without a client id
  // When creating an order
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the client id is missing', async () => {
    const createSpy = vi.spyOn(orderService, 'createOrder')
    const req = createMockRequest({ businessId: 'biz-1', body: { items: validItems } })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_CLIENT' }),
    )
    expect(createSpy).not.toHaveBeenCalled()
  })

  // Given a request with no items at all
  // When creating an order
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when there are no items', async () => {
    const createSpy = vi.spyOn(orderService, 'createOrder')
    const req = createMockRequest({ businessId: 'biz-1', body: { clientId: 'client-1', items: [] } })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_ITEMS' }),
    )
    expect(createSpy).not.toHaveBeenCalled()
  })

  // Given an item without a product name
  // When creating an order
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when an item has no product', async () => {
    const createSpy = vi.spyOn(orderService, 'createOrder')
    const req = createMockRequest({
      businessId: 'biz-1',
      body: { clientId: 'client-1', items: [{ unitPrice: 10 }] },
    })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_PRODUCT' }),
    )
    expect(createSpy).not.toHaveBeenCalled()
  })

  // Given an item with no price, or a price that is zero or negative
  // When creating an order
  // Then it should throw a 400 AppError without calling the service
  it.each([
    ['missing', { product: 'Camiseta' }],
    ['zero', { product: 'Camiseta', unitPrice: 0 }],
    ['negative', { product: 'Camiseta', unitPrice: -5 }],
  ])('throws a 400 AppError when the price is %s', async (_label, item) => {
    const createSpy = vi.spyOn(orderService, 'createOrder')
    const req = createMockRequest({
      businessId: 'biz-1',
      body: { clientId: 'client-1', items: [item] },
    })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_PRICE' }),
    )
    expect(createSpy).not.toHaveBeenCalled()
  })

  // Given an item with an invalid quantity
  // When creating an order
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the quantity is invalid', async () => {
    const createSpy = vi.spyOn(orderService, 'createOrder')
    const req = createMockRequest({
      businessId: 'biz-1',
      body: { clientId: 'client-1', items: [{ product: 'Camiseta', unitPrice: 10, quantity: 0 }] },
    })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'INVALID_QUANTITY' }),
    )
    expect(createSpy).not.toHaveBeenCalled()
  })

  // Given coordinates out of range
  // When creating an order
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the coordinates are invalid', async () => {
    const createSpy = vi.spyOn(orderService, 'createOrder')
    const req = createMockRequest({
      businessId: 'biz-1',
      body: { clientId: 'client-1', items: validItems, latitude: 200, longitude: 2 },
    })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'INVALID_COORDINATES' }),
    )
    expect(createSpy).not.toHaveBeenCalled()
  })

  // Given an expected date that cannot be parsed
  // When creating an order
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the expected date is invalid', async () => {
    const createSpy = vi.spyOn(orderService, 'createOrder')
    const req = createMockRequest({
      businessId: 'biz-1',
      body: { clientId: 'client-1', items: validItems, expectedDate: 'not-a-date' },
    })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'INVALID_DATE' }))
    expect(createSpy).not.toHaveBeenCalled()
  })
})

describe('list', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given query filters in the request
  // When listing orders
  // Then it should forward them to the service and respond with its paginated result
  it('forwards the query filters to the service and returns its result', async () => {
    const paginatedResult = {
      data: [{ id: 'order-1' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const listSpy = vi.spyOn(orderService, 'listOrders').mockResolvedValue(paginatedResult as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      query: { status: 'PENDING', channel: 'WHATSAPP' },
    })
    const res = createMockResponse()

    await list(req, res, vi.fn() as NextFunction)

    expect(listSpy).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({ status: 'PENDING', channel: 'WHATSAPP' }),
    )
    expect(res.json).toHaveBeenCalledWith(paginatedResult)
  })
})

describe('getById', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an existing order id
  // When fetching it
  // Then it should respond with the order
  it('responds with the order when found', async () => {
    vi.spyOn(orderService, 'getOrderById').mockResolvedValue({ id: 'order-1' } as never)

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'order-1' } })
    const res = createMockResponse()

    await getById(req, res, vi.fn() as NextFunction)

    expect(res.json).toHaveBeenCalledWith({ order: { id: 'order-1' } })
  })

  // Given an order id that doesn't exist (or belongs to another business)
  // When fetching it
  // Then it should throw a 404 AppError
  it('throws a 404 AppError when the order is not found', async () => {
    vi.spyOn(orderService, 'getOrderById').mockResolvedValue(null)

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'missing-id' } })
    const next = vi.fn()

    await getById(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('update', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a partial update (only the notes)
  // When updating an order
  // Then it should call the service and respond with the updated order
  it('updates the order and responds with it', async () => {
    const updateSpy = vi
      .spyOn(orderService, 'updateOrder')
      .mockResolvedValue({ id: 'order-1', notes: 'Entregar por la tarde' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      params: { id: 'order-1' },
      body: { notes: 'Entregar por la tarde' },
    })
    const res = createMockResponse()

    await update(req, res, vi.fn() as NextFunction)

    expect(updateSpy).toHaveBeenCalledWith(
      'biz-1',
      'user-1',
      'order-1',
      expect.objectContaining({ notes: 'Entregar por la tarde' }),
    )
    expect(res.json).toHaveBeenCalledWith({ order: { id: 'order-1', notes: 'Entregar por la tarde' } })
  })

  // Given a status of CANCELLED (this is how an order is cancelled: a normal status update)
  // When updating an order
  // Then it should reach the service with that status
  it('cancels the order through a normal status update', async () => {
    const updateSpy = vi
      .spyOn(orderService, 'updateOrder')
      .mockResolvedValue({ id: 'order-1', status: 'CANCELLED' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      params: { id: 'order-1' },
      body: { status: 'CANCELLED' },
    })
    const res = createMockResponse()

    await update(req, res, vi.fn() as NextFunction)

    expect(updateSpy).toHaveBeenCalledWith(
      'biz-1',
      'user-1',
      'order-1',
      expect.objectContaining({ status: 'CANCELLED' }),
    )
  })

  // Given an unknown status value
  // When updating an order
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the status is not valid', async () => {
    const updateSpy = vi.spyOn(orderService, 'updateOrder')
    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'order-1' },
      body: { status: 'ARCHIVED' },
    })
    const next = vi.fn()

    await update(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'INVALID_STATUS' }))
    expect(updateSpy).not.toHaveBeenCalled()
  })

  // Given replacement items with an invalid one
  // When updating an order
  // Then it should throw a 400 AppError without calling the service
  it('validates items when they are replaced', async () => {
    const updateSpy = vi.spyOn(orderService, 'updateOrder')
    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'order-1' },
      body: { items: [{ product: '', unitPrice: 10 }] },
    })
    const next = vi.fn()

    await update(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_PRODUCT' }),
    )
    expect(updateSpy).not.toHaveBeenCalled()
  })

  // Given an order id that doesn't exist (or belongs to another business)
  // When updating it
  // Then the 404 AppError thrown by the service should propagate
  it('propagates the 404 AppError when the order is not found', async () => {
    vi.spyOn(orderService, 'updateOrder').mockRejectedValue(
      new AppError('Pedido no encontrado', 404, 'ORDER_NOT_FOUND'),
    )

    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'missing-id' },
      body: { notes: 'x' },
    })
    const next = vi.fn()

    await update(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('remove', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an existing order id
  // When deleting it
  // Then it should call the service and respond 204 with no body
  it('deletes the order and responds 204', async () => {
    const deleteSpy = vi.spyOn(orderService, 'deleteOrder').mockResolvedValue(undefined)

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'order-1' } })
    const res = createMockResponse()

    await remove(req, res, vi.fn() as NextFunction)

    expect(deleteSpy).toHaveBeenCalledWith('biz-1', 'order-1')
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  // Given an order id that doesn't exist (or belongs to another business)
  // When deleting it
  // Then the 404 AppError thrown by the service should propagate
  it('propagates the 404 AppError when the order is not found', async () => {
    vi.spyOn(orderService, 'deleteOrder').mockRejectedValue(
      new AppError('Pedido no encontrado', 404, 'ORDER_NOT_FOUND'),
    )

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'missing-id' } })
    const next = vi.fn()

    await remove(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as orderModel from './order.model'
import * as clientModel from '../client/client.model'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import { createOrder, listOrders, updateOrder, deleteOrder } from './order.service'

vi.mock('./order.model')
vi.mock('../client/client.model')
vi.mock('../../shared/utils/prismaErrors')

describe('createOrder', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(orderModel.findMaxOrderNumber).mockResolvedValue(0)
  })

  // Given a client that does not belong to the business
  // When an order is created for it
  // Then a 404 CLIENT_NOT_FOUND is thrown and nothing is inserted
  it('throws CLIENT_NOT_FOUND when the client is not in the business', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue(null)

    await expect(
      createOrder('business-1', 'user-1', {
        clientId: 'client-1',
        items: [{ product: 'Camiseta', unitPrice: 15 }],
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: 'CLIENT_NOT_FOUND' })
    expect(orderModel.insertOrder).not.toHaveBeenCalled()
  })

  // Given an order with two items
  // When it is created
  // Then the price should be the sum of unitPrice * quantity for every item
  it('computes the price as the sum of its items', async () => {
    await createOrder('business-1', 'user-1', {
      clientId: 'client-1',
      items: [
        { product: 'Camiseta', quantity: 2, unitPrice: 15 },
        { product: 'Pañuelo', unitPrice: 10 },
      ],
    })

    const data = vi.mocked(orderModel.insertOrder).mock.calls[0][0] as never as { price: unknown }
    expect(String(data.price)).toBe('40')
  })

  // Given no existing orders in the business
  // When an order is created
  // Then it should be numbered 1
  it('starts numbering at 1 for the first order of a business', async () => {
    await createOrder('business-1', 'user-1', {
      clientId: 'client-1',
      items: [{ product: 'Camiseta', unitPrice: 15 }],
    })

    expect(orderModel.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({ number: 1, businessId: 'business-1', clientId: 'client-1' }),
    )
  })

  // Given an order is created
  // When it is inserted
  // Then it should start with status PENDING and a matching first history entry
  it('starts the order as PENDING with a matching history entry', async () => {
    await createOrder('business-1', 'user-1', {
      clientId: 'client-1',
      items: [{ product: 'Camiseta', unitPrice: 15 }],
    })

    expect(orderModel.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        statusHistory: { create: { status: 'PENDING', changedBy: 'user-1' } },
      }),
    )
  })

  // Given two concurrent orders race for the same order number
  // When the insert fails once on that unique constraint
  // Then it should recompute the next number and retry, succeeding the second time
  it('retries once when the order number races with another insert', async () => {
    vi.mocked(orderModel.findMaxOrderNumber).mockResolvedValueOnce(0).mockResolvedValueOnce(1)
    vi.mocked(getUniqueViolationFields).mockReturnValueOnce(['businessId', 'number'])
    vi.mocked(orderModel.insertOrder)
      .mockRejectedValueOnce(new Error('unique'))
      .mockResolvedValueOnce({ id: 'order-1' } as never)

    const result = await createOrder('business-1', 'user-1', {
      clientId: 'client-1',
      items: [{ product: 'Camiseta', unitPrice: 15 }],
    })

    expect(result).toEqual({ id: 'order-1' })
    expect(orderModel.insertOrder).toHaveBeenCalledTimes(2)
    expect(orderModel.insertOrder).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ number: 2 }),
    )
  })

  // Given the number keeps racing on every attempt
  // When an order is created
  // Then it should give up after a few attempts with a 409
  it('gives up after repeated number conflicts', async () => {
    vi.mocked(getUniqueViolationFields).mockReturnValue(['businessId', 'number'])
    vi.mocked(orderModel.insertOrder).mockRejectedValue(new Error('unique'))

    await expect(
      createOrder('business-1', 'user-1', {
        clientId: 'client-1',
        items: [{ product: 'Camiseta', unitPrice: 15 }],
      }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'ORDER_NUMBER_CONFLICT' })
  })

  // Given the insert fails for a reason unrelated to the order number
  // When an order is created
  // Then the original error should be rethrown untouched
  it('rethrows errors that are not a number conflict', async () => {
    const databaseError = new Error('connection lost')
    vi.mocked(getUniqueViolationFields).mockReturnValue(null)
    vi.mocked(orderModel.insertOrder).mockRejectedValue(databaseError)

    await expect(
      createOrder('business-1', 'user-1', {
        clientId: 'client-1',
        items: [{ product: 'Camiseta', unitPrice: 15 }],
      }),
    ).rejects.toBe(databaseError)
  })
})

describe('listOrders', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(orderModel.findOrdersPage).mockResolvedValue([])
    vi.mocked(orderModel.countOrders).mockResolvedValue(0)
    vi.mocked(orderModel.countOrdersByStatus).mockResolvedValue([])
  })

  // Given a status, a channel and a date range
  // When orders are listed
  // Then the where clause should combine all of them, scoped to the business
  it('builds the where clause from the filters', async () => {
    await listOrders('business-1', {
      status: 'PENDING',
      channel: 'WHATSAPP',
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
    })

    const where = vi.mocked(orderModel.findOrdersPage).mock.calls[0][0]
    expect(where.businessId).toBe('business-1')
    expect(where.status).toBe('PENDING')
    expect(where.channel).toBe('WHATSAPP')
    expect(where.createdAt).toEqual({ gte: new Date('2026-01-01'), lte: new Date('2026-01-31') })
  })

  // Given no filters at all
  // When orders are listed
  // Then only the business scoping should remain in the where clause
  it('scopes to the business when there are no filters', async () => {
    await listOrders('business-1', {})

    const where = vi.mocked(orderModel.findOrdersPage).mock.calls[0][0]
    expect(where).toEqual({ businessId: 'business-1' })
  })

  // Given the business has orders in only some statuses
  // When orders are listed
  // Then statusCounts should include every status, defaulting the missing ones to 0
  it('fills statusCounts for every status, defaulting missing ones to 0', async () => {
    vi.mocked(orderModel.countOrdersByStatus).mockResolvedValue([
      { status: 'DELIVERED', _count: 12 },
      { status: 'CANCELLED', _count: 2 },
    ])

    const result = await listOrders('business-1', {})

    expect(result.statusCounts).toEqual({
      PENDING: 0,
      PREPARING: 0,
      SHIPPED: 0,
      DELIVERED: 12,
      CANCELLED: 2,
    })
  })

  // Given an active status/channel/date filter on the list
  // When orders are listed
  // Then statusCounts should still be scoped to the whole business, not the current filter
  it('scopes statusCounts to the business, independent of the active filter', async () => {
    await listOrders('business-1', { status: 'PENDING', channel: 'WHATSAPP' })

    expect(orderModel.countOrdersByStatus).toHaveBeenCalledWith('business-1')
  })

  // Given a search term
  // When orders are listed
  // Then it should match either the client's name or the first item's product
  it('searches by client name or product', async () => {
    await listOrders('business-1', { search: 'camiseta' })

    const where = vi.mocked(orderModel.findOrdersPage).mock.calls[0][0]
    expect(where.OR).toEqual([
      { client: { name: { contains: 'camiseta', mode: 'insensitive' } } },
      { items: { some: { product: { contains: 'camiseta', mode: 'insensitive' } } } },
    ])
  })

  // Given an unparseable date range
  // When orders are listed
  // Then the invalid dates should be ignored instead of breaking the query
  it('ignores a date range that cannot be parsed', async () => {
    await listOrders('business-1', { dateFrom: 'not-a-date' })

    const where = vi.mocked(orderModel.findOrdersPage).mock.calls[0][0]
    expect(where.createdAt).toBeUndefined()
  })
})

describe('updateOrder', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1', status: 'PENDING' } as never)
    vi.mocked(orderModel.updateOrderWithItems).mockResolvedValue({ id: 'order-1' } as never)
  })

  // Given an order that does not belong to the business
  // When it is updated
  // Then a 404 ORDER_NOT_FOUND is thrown and nothing is written
  it('throws ORDER_NOT_FOUND when the order is not in the business', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue(null)

    await expect(updateOrder('business-1', 'user-1', 'order-1', { notes: 'x' })).rejects.toMatchObject(
      { statusCode: 404, code: 'ORDER_NOT_FOUND' },
    )
    expect(orderModel.updateOrderWithItems).not.toHaveBeenCalled()
  })

  // Given an update that only changes a plain field
  // When the order is updated
  // Then no status history entry should be appended
  it('does not append a status history entry when the status does not change', async () => {
    await updateOrder('business-1', 'user-1', 'order-1', { notes: 'Entregar por la tarde' })

    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { notes: 'Entregar por la tarde' },
      undefined,
      undefined,
    )
  })

  // Given an update that sets a new status (this is how an order gets cancelled)
  // When the order is updated
  // Then a status history entry should be appended with the acting user
  it('appends a status history entry when the status changes', async () => {
    await updateOrder('business-1', 'user-1', 'order-1', { status: 'CANCELLED' })

    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { status: 'CANCELLED' },
      undefined,
      { status: 'CANCELLED', changedBy: 'user-1' },
    )
  })

  // Given an update that resends the same status the order already has
  // When the order is updated
  // Then no new status history entry should be appended
  it('does not append a status history entry when the status is unchanged', async () => {
    await updateOrder('business-1', 'user-1', 'order-1', { status: 'PENDING' })

    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { status: 'PENDING' },
      undefined,
      undefined,
    )
  })

  // Given an order already in a final state (DELIVERED or CANCELLED)
  // When trying to move it to a different status
  // Then a 400 ORDER_STATUS_FINAL is thrown and nothing is written
  it.each([
    ['DELIVERED', 'PENDING'],
    ['CANCELLED', 'PREPARING'],
    ['DELIVERED', 'CANCELLED'],
  ])('rejects moving an order out of %s into %s', async (currentStatus, nextStatus) => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({
      id: 'order-1',
      status: currentStatus,
    } as never)

    await expect(
      updateOrder('business-1', 'user-1', 'order-1', { status: nextStatus as never }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'ORDER_STATUS_FINAL' })
    expect(orderModel.updateOrderWithItems).not.toHaveBeenCalled()
  })

  // Given an order already DELIVERED
  // When it is resent as DELIVERED again (idempotent update)
  // Then it should be accepted, since it is not actually a transition
  it('allows resending the same final status', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({
      id: 'order-1',
      status: 'DELIVERED',
    } as never)

    await updateOrder('business-1', 'user-1', 'order-1', { status: 'DELIVERED' })

    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { status: 'DELIVERED' },
      undefined,
      undefined,
    )
  })

  // Given an order in a non-final state (PENDING, PREPARING, SHIPPED)
  // When moving it to any other non-final or final status
  // Then the transition should be accepted, in any order
  it.each([
    ['PENDING', 'SHIPPED'],
    ['SHIPPED', 'PREPARING'],
    ['PREPARING', 'CANCELLED'],
  ])('allows moving freely between non-final statuses (%s -> %s)', async (currentStatus, nextStatus) => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({
      id: 'order-1',
      status: currentStatus,
    } as never)

    await updateOrder('business-1', 'user-1', 'order-1', { status: nextStatus as never })

    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { status: nextStatus },
      undefined,
      { status: nextStatus, changedBy: 'user-1' },
    )
  })

  // Given a new list of items
  // When the order is updated
  // Then the price should be recomputed from them and passed on to be replaced
  it('recomputes the price when items are replaced', async () => {
    await updateOrder('business-1', 'user-1', 'order-1', {
      items: [{ product: 'Camiseta', quantity: 3, unitPrice: 10 }],
    })

    const [, data, items] = vi.mocked(orderModel.updateOrderWithItems).mock.calls[0]
    expect(String((data as never as { price: unknown }).price)).toBe('30')
    expect(items).toEqual([{ product: 'Camiseta', description: undefined, quantity: 3, unitPrice: 10 }])
  })
})

describe('deleteOrder', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Given an order that does not belong to the business
  // When it is deleted
  // Then a 404 ORDER_NOT_FOUND is thrown and nothing is deleted
  it('throws ORDER_NOT_FOUND when the order is not in the business', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue(null)

    await expect(deleteOrder('business-1', 'order-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'ORDER_NOT_FOUND',
    })
    expect(orderModel.deleteOrderById).not.toHaveBeenCalled()
  })

  // Given an existing order
  // When it is deleted
  // Then the model should delete it by id
  it('deletes the order when it exists', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)

    await deleteOrder('business-1', 'order-1')

    expect(orderModel.deleteOrderById).toHaveBeenCalledWith('order-1')
  })
})

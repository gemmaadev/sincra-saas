import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as orderModel from './order.model'
import * as clientModel from '../client/client.model'
import * as authModel from '../auth/auth.model'
import * as tagModel from '../tag/tag.model'
import { geocodeAddress } from '../../shared/services/geocoding.service'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  assignTagToOrder,
  removeTagFromOrder,
} from './order.service'

vi.mock('./order.model')
vi.mock('../client/client.model')
vi.mock('../auth/auth.model')
vi.mock('../tag/tag.model')
vi.mock('../../shared/services/geocoding.service')
vi.mock('../../shared/utils/prismaErrors')

describe('createOrder', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(orderModel.findMaxOrderNumber).mockResolvedValue(0)
    vi.mocked(authModel.findBusinessCountry).mockResolvedValue('ES')
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

describe('createOrder geocoding', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(orderModel.findMaxOrderNumber).mockResolvedValue(0)
    vi.mocked(authModel.findBusinessCountry).mockResolvedValue('ES')
  })

  // Given an order with its own address and zone, in a Spanish business
  // When createOrder is called
  // Then the address is geocoded with the business country and the coordinates are saved
  it('saves the geocoded coordinates when none are given', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue({ latitude: 41.5467, longitude: 2.1044 })

    await createOrder('business-1', 'user-1', {
      clientId: 'client-1',
      items: [{ product: 'Camiseta', unitPrice: 15 }],
      address: 'Carrer de Sant Pau 33',
      zone: 'Sabadell',
    })

    expect(authModel.findBusinessCountry).toHaveBeenCalledWith('business-1')
    expect(geocodeAddress).toHaveBeenCalledWith({
      address: 'Carrer de Sant Pau 33',
      zone: 'Sabadell',
      countryCode: 'ES',
    })
    expect(orderModel.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 41.5467, longitude: 2.1044 }),
    )
  })

  // Given the order already comes with coordinates
  // When createOrder is called
  // Then they are kept and nothing is geocoded
  it('keeps the given coordinates without geocoding', async () => {
    await createOrder('business-1', 'user-1', {
      clientId: 'client-1',
      items: [{ product: 'Camiseta', unitPrice: 15 }],
      address: 'Carrer de Sant Pau 33',
      latitude: 41.1,
      longitude: 2.2,
    })

    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(orderModel.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 41.1, longitude: 2.2 }),
    )
  })

  // Given an order without its own address or zone
  // When createOrder is called
  // Then there is nothing to geocode, leaving it to fall back to the client's location
  it('does not geocode an order without address or zone', async () => {
    await createOrder('business-1', 'user-1', {
      clientId: 'client-1',
      items: [{ product: 'Camiseta', unitPrice: 15 }],
    })

    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(authModel.findBusinessCountry).not.toHaveBeenCalled()
    expect(orderModel.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: undefined, longitude: undefined }),
    )
  })

  // Given the geocoder finds nothing
  // When createOrder is called
  // Then the order is still created, without coordinates
  it('creates the order without coordinates when geocoding fails', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue(null)

    await createOrder('business-1', 'user-1', {
      clientId: 'client-1',
      items: [{ product: 'Camiseta', unitPrice: 15 }],
      zone: 'Sabadell',
    })

    expect(orderModel.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: undefined, longitude: undefined }),
    )
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
    expect(where.createdAt).toEqual({ gte: new Date('2026-01-01'), lt: new Date('2026-02-01') })
  })

  // Given a dateTo of the last day of the selected range
  // When orders are listed
  // Then the upper bound should be exclusive, so an order created later that same day is included
  it('includes the full last day of the date range', async () => {
    await listOrders('business-1', { dateTo: '2026-01-31' })

    const where = vi.mocked(orderModel.findOrdersPage).mock.calls[0][0]
    const createdAt = where.createdAt as { lt: Date }
    const lateInTheDay = new Date('2026-01-31T23:59:59.999Z')

    expect(lateInTheDay.getTime()).toBeLessThan(createdAt.lt.getTime())
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

  // Given a search term that is a whole number
  // When orders are listed
  // Then it should also match the order's own number
  it('also searches by order number when the term is a whole number', async () => {
    await listOrders('business-1', { search: '42' })

    const where = vi.mocked(orderModel.findOrdersPage).mock.calls[0][0]
    expect(where.OR).toEqual([
      { client: { name: { contains: '42', mode: 'insensitive' } } },
      { items: { some: { product: { contains: '42', mode: 'insensitive' } } } },
      { number: 42 },
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

  // Given an order that has its own description
  // When orders are listed
  // Then that description should be used as-is, and the raw items dropped from the response
  it('uses the order description when it has one', async () => {
    vi.mocked(orderModel.findOrdersPage).mockResolvedValue([
      {
        id: 'order-1',
        description: 'Pedido de temporada',
        items: [{ product: 'Camiseta', quantity: 2 }],
      },
    ] as never)

    const result = await listOrders('business-1', {})

    expect(result.data[0]).toMatchObject({ description: 'Pedido de temporada' })
    expect(result.data[0]).not.toHaveProperty('items')
  })

  // Given an order with no description but several items
  // When orders are listed
  // Then a summary should be built from the items instead, showing quantity only when it's more than 1
  it('falls back to a summary of the items when there is no description', async () => {
    vi.mocked(orderModel.findOrdersPage).mockResolvedValue([
      {
        id: 'order-1',
        description: null,
        items: [
          { product: 'Chaqueta oversize', quantity: 2 },
          { product: 'Bolso de piel', quantity: 1 },
        ],
      },
    ] as never)

    const result = await listOrders('business-1', {})

    expect(result.data[0]).toMatchObject({
      description: 'Chaqueta oversize x2, Bolso de piel',
    })
  })
})

describe('getOrderById', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Given no order matches that id in the business
  // When it is requested
  // Then it should return null
  it('returns null when the order is not found', async () => {
    vi.mocked(orderModel.findOrderWithDetails).mockResolvedValue(null)

    const result = await getOrderById('business-1', 'order-1')

    expect(result).toBeNull()
  })

  // Given an order with its own description
  // When it is requested
  // Then that description should be used as-is
  it('keeps the order description when it has one', async () => {
    vi.mocked(orderModel.findOrderWithDetails).mockResolvedValue({
      id: 'order-1',
      description: 'Pedido de temporada',
      items: [{ product: 'Camiseta', quantity: 2 }],
    } as never)

    const result = await getOrderById('business-1', 'order-1')

    expect(result).toMatchObject({ description: 'Pedido de temporada' })
  })

  // Given an order with no description but several items
  // When it is requested
  // Then a summary should be built from the items, same as the list endpoint
  it('falls back to a summary of the items when there is no description', async () => {
    vi.mocked(orderModel.findOrderWithDetails).mockResolvedValue({
      id: 'order-1',
      description: null,
      items: [
        { product: 'Chaqueta oversize', quantity: 2 },
        { product: 'Bolso de piel', quantity: 1 },
      ],
    } as never)

    const result = await getOrderById('business-1', 'order-1')

    expect(result).toMatchObject({ description: 'Chaqueta oversize x2, Bolso de piel' })
  })

  // Given an order with items
  // When it is requested
  // Then the items should still be returned, unlike the list endpoint which drops them
  it('keeps the items on the response', async () => {
    const items = [{ product: 'Camiseta', quantity: 1 }]
    vi.mocked(orderModel.findOrderWithDetails).mockResolvedValue({
      id: 'order-1',
      description: 'Pedido de temporada',
      items,
    } as never)

    const result = await getOrderById('business-1', 'order-1')

    expect(result).toMatchObject({ items })
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

    await expect(
      updateOrder('business-1', 'user-1', 'order-1', { description: 'x' }),
    ).rejects.toMatchObject({ statusCode: 404, code: 'ORDER_NOT_FOUND' })
    expect(orderModel.updateOrderWithItems).not.toHaveBeenCalled()
  })

  // Given an update that only changes a plain field
  // When the order is updated
  // Then no status history entry should be appended
  it('does not append a status history entry when the status does not change', async () => {
    await updateOrder('business-1', 'user-1', 'order-1', { description: 'Entregar por la tarde' })

    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { description: 'Entregar por la tarde' },
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

  // Given an order in one final state (DELIVERED or CANCELLED)
  // When trying to swap it directly into the *other* final state
  // Then a 400 ORDER_STATUS_FINAL is thrown and nothing is written
  it.each([
    ['DELIVERED', 'CANCELLED'],
    ['CANCELLED', 'DELIVERED'],
  ])('rejects swapping directly between final statuses (%s -> %s)', async (currentStatus, nextStatus) => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({
      id: 'order-1',
      status: currentStatus,
    } as never)

    await expect(
      updateOrder('business-1', 'user-1', 'order-1', { status: nextStatus as never }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'ORDER_STATUS_FINAL' })
    expect(orderModel.updateOrderWithItems).not.toHaveBeenCalled()
  })

  // Given an order marked DELIVERED or CANCELLED by mistake
  // When it is moved back into the normal (non-final) flow
  // Then it should be accepted and a new status history entry appended
  it.each([
    ['DELIVERED', 'PENDING'],
    ['CANCELLED', 'PREPARING'],
  ])('reopens a final order into the normal flow (%s -> %s)', async (currentStatus, nextStatus) => {
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

describe('updateOrder geocoding', () => {
  const existingOrder = { id: 'order-1', status: 'PENDING', address: 'Carrer Major 1', zone: 'Sabadell' }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(orderModel.findOrderById).mockResolvedValue(existingOrder as never)
    vi.mocked(orderModel.updateOrderWithItems).mockResolvedValue({ id: 'order-1' } as never)
    vi.mocked(authModel.findBusinessCountry).mockResolvedValue('ES')
  })

  // Given an order in Sabadell
  // When its zone changes to Barcelona
  // Then the new location is geocoded (keeping the old address) and the coordinates are updated
  it('recalculates the coordinates when the zone changes', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue({ latitude: 41.38, longitude: 2.17 })

    await updateOrder('business-1', 'user-1', 'order-1', { zone: 'Barcelona' })

    expect(geocodeAddress).toHaveBeenCalledWith({
      address: 'Carrer Major 1',
      zone: 'Barcelona',
      countryCode: 'ES',
    })
    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { zone: 'Barcelona', latitude: 41.38, longitude: 2.17 },
      undefined,
      undefined,
    )
  })

  // Given an order
  // When its address changes
  // Then the new address is geocoded with the current zone
  it('recalculates the coordinates when the address changes', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue({ latitude: 41.5, longitude: 2.1 })

    await updateOrder('business-1', 'user-1', 'order-1', { address: 'Carrer Nou 5' })

    expect(geocodeAddress).toHaveBeenCalledWith(
      expect.objectContaining({ address: 'Carrer Nou 5', zone: 'Sabadell' }),
    )
  })

  // Given an order
  // When the update sends the same address and zone, or neither
  // Then nothing is geocoded and no coordinates are written
  it('does not geocode when the address and zone are unchanged', async () => {
    await updateOrder('business-1', 'user-1', 'order-1', {
      description: 'Entregar por la tarde',
      address: 'Carrer Major 1',
      zone: 'Sabadell',
    })

    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { description: 'Entregar por la tarde', address: 'Carrer Major 1', zone: 'Sabadell' },
      undefined,
      undefined,
    )
  })

  // Given the update brings its own coordinates (e.g. picked on the map)
  // When the zone changes too
  // Then the given coordinates are kept and nothing is geocoded
  it('keeps the given coordinates without geocoding', async () => {
    await updateOrder('business-1', 'user-1', 'order-1', {
      zone: 'Barcelona',
      latitude: 41.1,
      longitude: 2.2,
    })

    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { zone: 'Barcelona', latitude: 41.1, longitude: 2.2 },
      undefined,
      undefined,
    )
  })

  // Given the geocoder finds nothing
  // When the zone changes
  // Then the change is saved and the old coordinates are left untouched
  it('saves the change without touching the coordinates when geocoding fails', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue(null)

    await updateOrder('business-1', 'user-1', 'order-1', { zone: 'Barcelona' })

    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { zone: 'Barcelona' },
      undefined,
      undefined,
    )
  })

  // Given an order with an address and a zone
  // When both are cleared
  // Then there is nothing to geocode
  it('does not geocode when both address and zone are cleared', async () => {
    await updateOrder('business-1', 'user-1', 'order-1', { address: null, zone: null })

    expect(geocodeAddress).not.toHaveBeenCalled()
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

describe('assignTagToOrder', () => {
  beforeEach(() => vi.resetAllMocks())

  // Given an order and a tag of the same business, not assigned yet
  // When the tag is assigned
  // Then a new assignment is created
  it('assigns the tag to the order', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)
    vi.mocked(tagModel.findTagById).mockResolvedValue({ id: 'tag-1' } as never)
    vi.mocked(orderModel.findActiveOrderTag).mockResolvedValue(null)

    await assignTagToOrder('business-1', 'order-1', 'tag-1')

    expect(tagModel.findTagById).toHaveBeenCalledWith('business-1', 'tag-1')
    expect(orderModel.insertOrderTag).toHaveBeenCalledWith('order-1', 'tag-1')
  })

  // Given an order that is not in the business
  // When a tag is assigned
  // Then ORDER_NOT_FOUND is thrown and nothing is created
  it('throws ORDER_NOT_FOUND when the order is not in the business', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue(null)

    await expect(assignTagToOrder('business-1', 'order-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'ORDER_NOT_FOUND',
    })
    expect(orderModel.insertOrderTag).not.toHaveBeenCalled()
  })

  // Given a tag that belongs to another business
  // When it is assigned
  // Then TAG_NOT_FOUND is thrown and nothing is created
  it('throws TAG_NOT_FOUND when the tag is not in the business', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)
    vi.mocked(tagModel.findTagById).mockResolvedValue(null)

    await expect(assignTagToOrder('business-1', 'order-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'TAG_NOT_FOUND',
    })
    expect(orderModel.insertOrderTag).not.toHaveBeenCalled()
  })

  // Given the order already has that tag active
  // When it is assigned again
  // Then a 409 TAG_ALREADY_ASSIGNED is thrown and no duplicate is created
  it('rejects a tag that is already assigned', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)
    vi.mocked(tagModel.findTagById).mockResolvedValue({ id: 'tag-1' } as never)
    vi.mocked(orderModel.findActiveOrderTag).mockResolvedValue({ id: 'assignment-1' } as never)

    await expect(assignTagToOrder('business-1', 'order-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'TAG_ALREADY_ASSIGNED',
    })
    expect(orderModel.insertOrderTag).not.toHaveBeenCalled()
  })
})

describe('removeTagFromOrder', () => {
  beforeEach(() => vi.resetAllMocks())

  // Given an order with an active assignment of the tag
  // When the tag is removed
  // Then the assignment is marked as removed (the row is kept)
  it('marks the assignment as removed', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)
    vi.mocked(orderModel.findActiveOrderTag).mockResolvedValue({ id: 'assignment-1' } as never)

    await removeTagFromOrder('business-1', 'order-1', 'tag-1')

    expect(orderModel.findActiveOrderTag).toHaveBeenCalledWith('order-1', 'tag-1')
    expect(orderModel.markOrderTagRemoved).toHaveBeenCalledWith('assignment-1')
  })

  // Given an order that does not have that tag active
  // When the tag is removed
  // Then ORDER_TAG_NOT_FOUND is thrown
  it('throws ORDER_TAG_NOT_FOUND when the order does not have the tag', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)
    vi.mocked(orderModel.findActiveOrderTag).mockResolvedValue(null)

    await expect(removeTagFromOrder('business-1', 'order-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'ORDER_TAG_NOT_FOUND',
    })
    expect(orderModel.markOrderTagRemoved).not.toHaveBeenCalled()
  })

  // Given an order that is not in the business
  // When a tag is removed
  // Then ORDER_NOT_FOUND is thrown
  it('throws ORDER_NOT_FOUND when the order is not in the business', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue(null)

    await expect(removeTagFromOrder('business-1', 'order-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'ORDER_NOT_FOUND',
    })
  })
})

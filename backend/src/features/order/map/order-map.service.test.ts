import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as orderMapModel from './order-map.model'
import { getOrderMap } from './order-map.service'

vi.mock('./order-map.model')

describe('getOrderMap', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Given two orders in Barcelona and one in Girona
  // When the order map is built
  // Then the zones should be counted and sorted from most to least orders
  it('groups orders by their own zone, most orders first', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      { id: 'order-1', zone: 'Barcelona', client: { zone: null } },
      { id: 'order-2', zone: 'Barcelona', client: { zone: null } },
      { id: 'order-3', zone: 'Girona', client: { zone: null } },
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.total).toBe(3)
    expect(result.zones).toEqual([
      { zone: 'Barcelona', count: 2, percentage: 66.7 },
      { zone: 'Girona', count: 1, percentage: 33.3 },
    ])
    expect(result.ordersWithoutZone).toBe(0)
  })

  // Given an order with no zone of its own, but whose client has one
  // When the order map is built
  // Then that order should be counted under the client's zone
  it('falls back to the client zone when the order has none of its own', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      { id: 'order-1', zone: null, client: { zone: 'Manresa' } },
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.zones).toEqual([{ zone: 'Manresa', count: 1, percentage: 100 }])
  })

  // Given an order with no zone and a client with no zone either
  // When the order map is built
  // Then that order should be excluded from the zones and counted as without a zone
  it('counts an order without any resolvable zone as "without zone", not in the list', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      { id: 'order-1', zone: null, client: { zone: null } },
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.zones).toEqual([])
    expect(result.ordersWithoutZone).toBe(1)
  })
})

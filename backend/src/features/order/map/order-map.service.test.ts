import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '../../../generated/prisma/client'
import * as orderMapModel from './order-map.model'
import { buildMapOrders, getOrderMap } from './order-map.service'
import type { OrderMapRecord } from './order-map.types'

vi.mock('./order-map.model')

function record(overrides: Partial<OrderMapRecord> = {}): OrderMapRecord {
  return {
    id: 'order-1',
    number: 1,
    status: 'DELIVERED' as const,
    channel: 'WHATSAPP',
    price: new Prisma.Decimal('50'),
    zone: 'Barcelona',
    latitude: null,
    longitude: null,
    client: { name: 'Ana', zone: null, latitude: null, longitude: null },
    ...overrides,
  }
}

describe('buildMapOrders', () => {
  // Given an order with its own coordinates
  // When the map orders are built
  // Then it should be placed at them, marked as not approximate
  it('places an order at its own coordinates', () => {
    const orders = buildMapOrders([record({ latitude: 41.1, longitude: 2.2 })])

    expect(orders).toEqual([
      expect.objectContaining({ latitude: 41.1, longitude: 2.2, approximate: false }),
    ])
  })

  // Given an order without its own coordinates, whose client has them
  // When the map orders are built
  // Then it should fall back to the client's location, marked as approximate
  it('falls back to the client location when the order has none of its own', () => {
    const orders = buildMapOrders([
      record({ latitude: null, longitude: null, client: { name: 'Ana', zone: null, latitude: 41.3, longitude: 2.1 } }),
    ])

    expect(orders).toEqual([
      expect.objectContaining({ latitude: 41.3, longitude: 2.1, approximate: true }),
    ])
  })

  // Given an order with neither its own coordinates nor its client's
  // When the map orders are built
  // Then it should be left out, since it has no location to place it at
  it('excludes an order with no resolvable location at all', () => {
    const orders = buildMapOrders([record({ latitude: null, longitude: null })])

    expect(orders).toEqual([])
  })

  // Given an order
  // When the map orders are built
  // Then it should carry its number, status, channel, price and client name for the marker/popup
  it('carries the order and client fields needed for the marker', () => {
    const orders = buildMapOrders([
      record({
        id: 'order-1',
        number: 7,
        status: 'SHIPPED',
        channel: 'INSTAGRAM',
        price: new Prisma.Decimal('99.90'),
        zone: 'Barcelona',
        latitude: 41.1,
        longitude: 2.2,
        client: { name: 'Laura Martínez', zone: null, latitude: null, longitude: null },
      }),
    ])

    expect(orders).toEqual([
      {
        id: 'order-1',
        number: 7,
        status: 'SHIPPED',
        channel: 'INSTAGRAM',
        price: '99.9',
        zone: 'Barcelona',
        clientName: 'Laura Martínez',
        latitude: 41.1,
        longitude: 2.2,
        approximate: false,
      },
    ])
  })
})

describe('getOrderMap', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Given a delivered order, a pending one and a cancelled one
  // When the order map is built
  // Then "total" should count all of them, but "deliveredRevenue" only the delivered one
  it('counts every order in total, but only sums the revenue of delivered ones', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      record({ id: 'order-1', status: 'DELIVERED', price: new Prisma.Decimal('50') }),
      record({ id: 'order-2', status: 'PENDING', price: new Prisma.Decimal('30') }),
      record({ id: 'order-3', status: 'CANCELLED', price: new Prisma.Decimal('500') }),
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.total).toBe(3)
    expect(result.deliveredRevenue).toBe('50')
  })

  // Given two delivered orders in Barcelona and one in Girona
  // When the order map is built
  // Then the zones should group only the delivered orders, with their revenue
  it('groups delivered orders by zone with their revenue', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      record({ id: 'order-1', zone: 'Barcelona', price: new Prisma.Decimal('40') }),
      record({ id: 'order-2', zone: 'Barcelona', price: new Prisma.Decimal('60') }),
      record({ id: 'order-3', zone: 'Girona', price: new Prisma.Decimal('20') }),
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.zones).toEqual([
      { zone: 'Barcelona', count: 2, revenue: '100', percentage: 66.7 },
      { zone: 'Girona', count: 1, revenue: '20', percentage: 33.3 },
    ])
  })

  // Given a zone with many small orders and another with a single, bigger one
  // When the order map is built
  // Then the zones should be ordered by revenue, not by how many orders they have
  it('orders the zones by revenue, not by order count', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      record({ id: 'order-1', zone: 'Vic', price: new Prisma.Decimal('10') }),
      record({ id: 'order-2', zone: 'Vic', price: new Prisma.Decimal('10') }),
      record({ id: 'order-3', zone: 'Vic', price: new Prisma.Decimal('10') }),
      record({ id: 'order-4', zone: 'Bilbao', price: new Prisma.Decimal('1000') }),
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.zones.map((zone) => zone.zone)).toEqual(['Bilbao', 'Vic'])
  })

  // Given a delivered order with no zone of its own, but whose client has one
  // When the order map is built
  // Then that order should be counted under the client's zone
  it('falls back to the client zone when the order has none of its own', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      record({ zone: null, client: { zone: 'Manresa' } }),
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.zones).toEqual([{ zone: 'Manresa', count: 1, revenue: '50', percentage: 100 }])
  })

  // Given a delivered order with no resolvable zone at all
  // When the order map is built
  // Then it should be excluded from the zones but still counted in total and revenue
  it('excludes an order without any resolvable zone from the zones list', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      record({ zone: null, client: { zone: null } }),
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.total).toBe(1)
    expect(result.deliveredRevenue).toBe('50')
    expect(result.zones).toEqual([])
  })

  // Given a pending and a cancelled order, neither of them delivered
  // When the order map is built
  // Then the zones list should be empty, even though both have a zone
  it('leaves the zones empty when no order is delivered yet', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      record({ status: 'PENDING', zone: 'Barcelona' }),
      record({ status: 'CANCELLED', zone: 'Barcelona' }),
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.zones).toEqual([])
  })

  // Given an order with its own coordinates and one with none at all
  // When the order map is built
  // Then "orders" should include the located one and exclude the unlocatable one
  it('includes the located orders and excludes the unlocatable ones', async () => {
    vi.mocked(orderMapModel.findOrdersForMap).mockResolvedValue([
      record({ id: 'order-1', latitude: 41.1, longitude: 2.2 }),
      record({ id: 'order-2', latitude: null, longitude: null }),
    ] as never)

    const result = await getOrderMap('business-1', {})

    expect(result.orders).toEqual([
      expect.objectContaining({ id: 'order-1', latitude: 41.1, longitude: 2.2 }),
    ])
  })
})

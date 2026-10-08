import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../../config/db'
import { findOrdersForMap } from './order-map.model'

vi.mock('../../../config/db', () => ({
  default: { order: { findMany: vi.fn() } },
}))

function lastWhere() {
  return vi.mocked(prisma.order.findMany).mock.calls[0][0]?.where
}

describe('findOrdersForMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given no filters
  // When the map orders are requested
  // Then only the business should restrict the query
  it('restricts the query to the business and nothing else without filters', async () => {
    await findOrdersForMap('business-1', {})

    expect(lastWhere()).toEqual({ businessId: 'business-1' })
  })

  // Given a channel
  // When the map orders are requested
  // Then the query should require that exact channel
  it('filters by channel', async () => {
    await findOrdersForMap('business-1', { channel: 'WHATSAPP' })

    expect(lastWhere()).toEqual({ businessId: 'business-1', channel: 'WHATSAPP' })
  })

  // Given a date range
  // When the map orders are requested
  // Then the creation date should be bounded on both sides
  it('filters by creation date range', async () => {
    const from = new Date('2026-01-01T00:00:00.000Z')
    const to = new Date('2026-01-31T23:59:59.999Z')

    await findOrdersForMap('business-1', { from, to })

    expect(lastWhere()).toEqual({
      businessId: 'business-1',
      createdAt: { gte: from, lte: to },
    })
  })

  // Given any filters
  // When the map orders are requested
  // Then it should select the fields needed to render markers and zone/revenue summaries,
  // including the order's own location and its client's (for the location fallback)
  it('selects the order and client fields needed for the map', async () => {
    await findOrdersForMap('business-1', {})

    expect(vi.mocked(prisma.order.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          id: true,
          number: true,
          status: true,
          channel: true,
          price: true,
          zone: true,
          latitude: true,
          longitude: true,
          client: { select: { name: true, zone: true, latitude: true, longitude: true } },
        },
      }),
    )
  })
})

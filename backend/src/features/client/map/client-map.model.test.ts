import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../../config/db'
import { findClientsForMap, findZoneCoordinates } from './client-map.model'

vi.mock('../../../config/db', () => ({
  default: { client: { findMany: vi.fn() } },
}))

function lastWhere() {
  return vi.mocked(prisma.client.findMany).mock.calls[0][0]?.where
}

describe('findClientsForMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given no filters
  // When the map clients are requested
  // Then only the business should restrict the query
  it('restricts the query to the business and nothing else without filters', async () => {
    await findClientsForMap('business-1', {})

    expect(lastWhere()).toEqual({ businessId: 'business-1' })
  })

  // Given a channel and a type
  // When the map clients are requested
  // Then the query should require that channel in the list and that exact type
  it('filters by channel and type', async () => {
    await findClientsForMap('business-1', { channel: 'GMAIL', type: 'empresa' })

    expect(lastWhere()).toEqual({
      businessId: 'business-1',
      channels: { has: 'GMAIL' },
      type: 'empresa',
    })
  })

  // Given a date range
  // When the map clients are requested
  // Then the creation date should be bounded on both sides
  it('filters by creation date range', async () => {
    const from = new Date('2026-01-01T00:00:00.000Z')
    const to = new Date('2026-01-31T23:59:59.999Z')

    await findClientsForMap('business-1', { from, to })

    expect(lastWhere()).toEqual({
      businessId: 'business-1',
      createdAt: { gte: from, lte: to },
    })
  })

  // Given only one end of the range
  // When the map clients are requested
  // Then only that end should bound the creation date
  it('accepts an open ended date range', async () => {
    const from = new Date('2026-01-01T00:00:00.000Z')

    await findClientsForMap('business-1', { from })

    expect(lastWhere()).toEqual({ businessId: 'business-1', createdAt: { gte: from } })
  })

  // Given any filters
  // When the map clients are requested
  // Then only the columns the map needs should be selected, newest first
  it('selects only the map columns, newest first', async () => {
    await findClientsForMap('business-1', {})

    expect(vi.mocked(prisma.client.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          zone: true,
          address: true,
          channels: true,
          type: true,
          _count: { select: { orders: true } },
          orders: { where: { status: 'DELIVERED' }, select: { price: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    )
  })

  // Given a business
  // When the zone coordinates are requested
  // Then only that business's clients with a zone and both coordinates should be asked for, with no other filter
  it('asks only for clients that have a zone and coordinates, whatever the map filters', async () => {
    await findZoneCoordinates('business-1')

    expect(vi.mocked(prisma.client.findMany)).toHaveBeenCalledWith({
      where: {
        businessId: 'business-1',
        zone: { not: null },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: { zone: true, latitude: true, longitude: true },
    })
  })
})

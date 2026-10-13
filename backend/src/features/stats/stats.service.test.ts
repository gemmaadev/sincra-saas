import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as statsModel from './stats.model'
import { getOverview } from './stats.service'

describe('getOverview', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given new clients and orders created in the range, and two delivered orders
  // When getting the overview
  // Then it should report the counts, the average delivery time and the revenue
  it('builds the overview from clients, orders and delivered orders', async () => {
    vi.spyOn(statsModel, 'countClientsCreatedInRange').mockResolvedValue(5)
    vi.spyOn(statsModel, 'countOrdersCreatedInRange').mockResolvedValue(12)
    vi.spyOn(statsModel, 'findDeliveredOrdersInRange').mockResolvedValue([
      {
        id: 'order-1',
        price: 100 as never,
        createdAt: new Date('2026-10-01T00:00:00'),
        statusHistory: [{ changedAt: new Date('2026-10-03T00:00:00') }],
      },
      {
        id: 'order-2',
        price: 50 as never,
        createdAt: new Date('2026-10-05T00:00:00'),
        statusHistory: [{ changedAt: new Date('2026-10-06T00:00:00') }],
      },
    ] as never)

    const overview = await getOverview('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(overview).toEqual({
      newClients: 5,
      ordersCreated: 12,
      averageDeliveryDays: 1.5,
      revenue: '150',
    })
  })

  // Given no delivered orders in the range
  // When getting the overview
  // Then the average delivery time should be null, and revenue zero
  it('reports a null average delivery time and zero revenue with no delivered orders', async () => {
    vi.spyOn(statsModel, 'countClientsCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'countOrdersCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'findDeliveredOrdersInRange').mockResolvedValue([])

    const overview = await getOverview('business-1', {})

    expect(overview).toEqual({
      newClients: 0,
      ordersCreated: 0,
      averageDeliveryDays: null,
      revenue: '0',
    })
  })

  // Given a delivered order with no DELIVERED entry in its status history (shouldn't happen, but
  // the join is a safety net)
  // When getting the overview
  // Then that order should be excluded from the average delivery time
  it('excludes a delivered order with no DELIVERED status history entry from the average', async () => {
    vi.spyOn(statsModel, 'countClientsCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'countOrdersCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'findDeliveredOrdersInRange').mockResolvedValue([
      { id: 'order-1', price: 10 as never, createdAt: new Date(), statusHistory: [] },
    ] as never)

    const overview = await getOverview('business-1', {})

    expect(overview.averageDeliveryDays).toBeNull()
    expect(overview.revenue).toBe('10')
  })

  // Given dateFrom/dateTo query strings
  // When getting the overview
  // Then the model functions should receive a parsed Date range
  it('parses dateFrom/dateTo into a Date range before querying', async () => {
    const countClients = vi.spyOn(statsModel, 'countClientsCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'countOrdersCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'findDeliveredOrdersInRange').mockResolvedValue([])

    await getOverview('business-1', { dateFrom: '2026-10-01', dateTo: '2026-10-31' })

    expect(countClients).toHaveBeenCalledWith('business-1', {
      gte: new Date('2026-10-01'),
      lte: new Date('2026-10-31'),
    })
  })

  // Given an invalid dateFrom
  // When getting the overview
  // Then that bound should be silently ignored, matching the orders list filters
  it('ignores an invalid dateFrom instead of throwing', async () => {
    const countClients = vi.spyOn(statsModel, 'countClientsCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'countOrdersCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'findDeliveredOrdersInRange').mockResolvedValue([])

    await getOverview('business-1', { dateFrom: 'not-a-date', dateTo: '2026-10-31' })

    expect(countClients).toHaveBeenCalledWith('business-1', { lte: new Date('2026-10-31') })
  })

  // Given no date filters at all
  // When getting the overview
  // Then no range should be passed to the model functions
  it('passes no range when no date filters are given', async () => {
    const countClients = vi.spyOn(statsModel, 'countClientsCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'countOrdersCreatedInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'findDeliveredOrdersInRange').mockResolvedValue([])

    await getOverview('business-1', {})

    expect(countClients).toHaveBeenCalledWith('business-1', undefined)
  })
})

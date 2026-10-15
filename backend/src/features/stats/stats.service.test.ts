import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '../../generated/prisma/client'
import * as statsModel from './stats.model'
import {
  getAiSummary,
  getChannelPerformance,
  getClientsByType,
  getDashboard,
  getOrdersByStatus,
  getOrdersEvolution,
  getOverview,
} from './stats.service'

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

describe('getOrdersByStatus', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given order counts for some, but not all, statuses
  // When getting the orders-by-status breakdown
  // Then it should return all 5 statuses in their lifecycle order, zero-count ones included,
  // each with its share of the total
  it('returns all statuses in lifecycle order, with zero-count ones included', async () => {
    vi.spyOn(statsModel, 'countOrdersByStatusInRange').mockResolvedValue([
      { status: 'DELIVERED', _count: 6 },
      { status: 'PENDING', _count: 3 },
      { status: 'CANCELLED', _count: 1 },
    ] as never)

    const result = await getOrdersByStatus('business-1', {})

    expect(result).toEqual({
      total: 10,
      statuses: [
        { status: 'PENDING', count: 3, percentage: 30 },
        { status: 'PREPARING', count: 0, percentage: 0 },
        { status: 'SHIPPED', count: 0, percentage: 0 },
        { status: 'DELIVERED', count: 6, percentage: 60 },
        { status: 'CANCELLED', count: 1, percentage: 10 },
      ],
    })
  })

  // Given no orders at all in the range
  // When getting the orders-by-status breakdown
  // Then every percentage should be 0, not NaN or a division error
  it('reports 0% for every status when there are no orders', async () => {
    vi.spyOn(statsModel, 'countOrdersByStatusInRange').mockResolvedValue([])

    const result = await getOrdersByStatus('business-1', {})

    expect(result.total).toBe(0)
    expect(result.statuses.every((entry) => entry.percentage === 0)).toBe(true)
  })

  // Given dateFrom/dateTo query strings
  // When getting the orders-by-status breakdown
  // Then the model function should receive a parsed Date range
  it('parses dateFrom/dateTo into a Date range before querying', async () => {
    const countByStatus = vi.spyOn(statsModel, 'countOrdersByStatusInRange').mockResolvedValue([])

    await getOrdersByStatus('business-1', { dateFrom: '2026-10-01', dateTo: '2026-10-31' })

    expect(countByStatus).toHaveBeenCalledWith('business-1', {
      gte: new Date('2026-10-01'),
      lte: new Date('2026-10-31'),
    })
  })
})

describe('getOrdersEvolution', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given orders created on specific days within the range, with gaps on days with no orders
  // When getting the daily evolution
  // Then it should return one point per day in the range, zero-filling the gaps
  it('fills in days with no orders when granularity is daily', async () => {
    vi.spyOn(statsModel, 'findOrderCreatedDatesInRange').mockResolvedValue([
      { createdAt: new Date('2026-10-01T09:00:00') },
      { createdAt: new Date('2026-10-01T18:00:00') },
      { createdAt: new Date('2026-10-03T10:00:00') },
    ] as never)

    const evolution = await getOrdersEvolution('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-03',
    })

    expect(evolution).toEqual({
      granularity: 'daily',
      points: [
        { date: '2026-10-01', count: 2 },
        { date: '2026-10-02', count: 0 },
        { date: '2026-10-03', count: 1 },
      ],
    })
  })

  // Given orders created across two different weeks
  // When getting the weekly evolution
  // Then it should group them by the Monday starting their week
  it('groups orders by week (Monday start) when granularity is weekly', async () => {
    vi.spyOn(statsModel, 'findOrderCreatedDatesInRange').mockResolvedValue([
      { createdAt: new Date('2026-10-01T09:00:00') }, // Thursday, week of Sep 28
      { createdAt: new Date('2026-10-06T09:00:00') }, // Tuesday, week of Oct 5
    ] as never)

    const evolution = await getOrdersEvolution('business-1', {
      dateFrom: '2026-09-28',
      dateTo: '2026-10-11',
      granularity: 'weekly',
    })

    expect(evolution).toEqual({
      granularity: 'weekly',
      points: [
        { date: '2026-09-28', count: 1 },
        { date: '2026-10-05', count: 1 },
      ],
    })
  })

  // Given no dateFrom/dateTo at all
  // When getting the evolution
  // Then there's no continuous range to fill, so only buckets with actual orders are returned
  it('falls back to only the buckets with data when no date range is given', async () => {
    vi.spyOn(statsModel, 'findOrderCreatedDatesInRange').mockResolvedValue([
      { createdAt: new Date('2026-10-03T09:00:00') },
      { createdAt: new Date('2026-10-01T09:00:00') },
    ] as never)

    const evolution = await getOrdersEvolution('business-1', {})

    expect(evolution).toEqual({
      granularity: 'daily',
      points: [
        { date: '2026-10-01', count: 1 },
        { date: '2026-10-03', count: 1 },
      ],
    })
  })

  // Given no orders at all
  // When getting the daily evolution over a 2-day range
  // Then every point should be zero, not omitted
  it('zero-fills every point when there are no orders', async () => {
    vi.spyOn(statsModel, 'findOrderCreatedDatesInRange').mockResolvedValue([])

    const evolution = await getOrdersEvolution('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-02',
    })

    expect(evolution).toEqual({
      granularity: 'daily',
      points: [
        { date: '2026-10-01', count: 0 },
        { date: '2026-10-02', count: 0 },
      ],
    })
  })
})

describe('getClientsByType', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given clients with different types, sorted here out of count order on purpose
  // When getting the clients-by-type breakdown
  // Then it should return them sorted by count descending, with their share of the total
  it('returns client types sorted by count descending', async () => {
    vi.spyOn(statsModel, 'countClientsByTypeInRange').mockResolvedValue([
      { type: 'particular', _count: 2 },
      { type: 'empresa', _count: 6 },
      { type: 'autónomo', _count: 2 },
    ] as never)

    const result = await getClientsByType('business-1', {})

    expect(result).toEqual({
      total: 10,
      types: [
        { type: 'empresa', count: 6, percentage: 60 },
        { type: 'autónomo', count: 2, percentage: 20 },
        { type: 'particular', count: 2, percentage: 20 },
      ],
    })
  })

  // Given clients with null, empty and whitespace-only type values
  // When getting the clients-by-type breakdown
  // Then they should all be merged into a single "Sin segmento" bucket
  it('merges null, empty and whitespace-only types into one "Sin segmento" bucket', async () => {
    vi.spyOn(statsModel, 'countClientsByTypeInRange').mockResolvedValue([
      { type: null, _count: 2 },
      { type: '', _count: 1 },
      { type: '   ', _count: 1 },
    ] as never)

    const result = await getClientsByType('business-1', {})

    expect(result).toEqual({
      total: 4,
      types: [{ type: 'Sin segmento', count: 4, percentage: 100 }],
    })
  })

  // Given no clients at all
  // When getting the clients-by-type breakdown
  // Then it should report an empty list, not an error
  it('returns an empty breakdown when there are no clients', async () => {
    vi.spyOn(statsModel, 'countClientsByTypeInRange').mockResolvedValue([])

    const result = await getClientsByType('business-1', {})

    expect(result).toEqual({ total: 0, types: [] })
  })
})

describe('getAiSummary', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given AI-generated clients and orders in the range
  // When getting the AI summary
  // Then it should report both counts, with no confirmed/pending breakdown
  it('reports the count of AI-generated clients and orders', async () => {
    vi.spyOn(statsModel, 'countAiGeneratedClientsInRange').mockResolvedValue(3)
    vi.spyOn(statsModel, 'countAiGeneratedOrdersInRange').mockResolvedValue(7)

    const summary = await getAiSummary('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(summary).toEqual({ clientsDetected: 3, ordersDetected: 7 })
  })

  // Given no AI-generated records at all
  // When getting the AI summary
  // Then both counts should be zero
  it('reports zero for both when nothing was AI-generated', async () => {
    vi.spyOn(statsModel, 'countAiGeneratedClientsInRange').mockResolvedValue(0)
    vi.spyOn(statsModel, 'countAiGeneratedOrdersInRange').mockResolvedValue(0)

    const summary = await getAiSummary('business-1', {})

    expect(summary).toEqual({ clientsDetected: 0, ordersDetected: 0 })
  })
})

describe('getChannelPerformance', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given delivered orders grouped by channel, out of revenue order on purpose
  // When getting channel performance
  // Then it should compute revenue and average ticket per channel, sorted by revenue descending
  it('computes revenue and average ticket per channel, sorted by revenue descending', async () => {
    vi.spyOn(statsModel, 'findDeliveredOrdersByChannelInRange').mockResolvedValue([
      { channel: 'WHATSAPP', _sum: { price: new Prisma.Decimal(100) }, _count: 2 },
      { channel: 'GMAIL', _sum: { price: new Prisma.Decimal(300) }, _count: 3 },
    ] as never)

    const result = await getChannelPerformance('business-1', {})

    expect(result).toEqual({
      entries: [
        { channel: 'GMAIL', orderCount: 3, revenue: '300', averageTicket: '100' },
        { channel: 'WHATSAPP', orderCount: 2, revenue: '100', averageTicket: '50' },
      ],
    })
  })

  // Given a channel group with no orders (shouldn't happen from a real groupBy, but a safety net)
  // When getting channel performance
  // Then its average ticket should be zero, not a division error
  it('reports a zero average ticket instead of dividing by zero', async () => {
    vi.spyOn(statsModel, 'findDeliveredOrdersByChannelInRange').mockResolvedValue([
      { channel: 'GMAIL', _sum: { price: null }, _count: 0 },
    ] as never)

    const result = await getChannelPerformance('business-1', {})

    expect(result.entries[0]).toEqual({
      channel: 'GMAIL',
      orderCount: 0,
      revenue: '0',
      averageTicket: '0',
    })
  })

  // Given no delivered orders at all
  // When getting channel performance
  // Then it should return an empty list
  it('returns an empty list when there are no delivered orders', async () => {
    vi.spyOn(statsModel, 'findDeliveredOrdersByChannelInRange').mockResolvedValue([])

    const result = await getChannelPerformance('business-1', {})

    expect(result).toEqual({ entries: [] })
  })
})

describe('getDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given the data behind every widget
  // When getting the dashboard
  // Then it should combine all of it into a single response
  it('combines every widget into one response', async () => {
    vi.spyOn(statsModel, 'countClientsCreatedInRange').mockResolvedValue(5)
    vi.spyOn(statsModel, 'countOrdersCreatedInRange').mockResolvedValue(12)
    vi.spyOn(statsModel, 'findDeliveredOrdersInRange').mockResolvedValue([])
    vi.spyOn(statsModel, 'countOrdersByStatusInRange').mockResolvedValue([
      { status: 'PENDING', _count: 3 },
    ] as never)
    vi.spyOn(statsModel, 'findOrderCreatedDatesInRange').mockResolvedValue([
      { createdAt: new Date('2026-10-01T09:00:00') },
    ] as never)
    vi.spyOn(statsModel, 'countClientsByTypeInRange').mockResolvedValue([
      { type: 'particular', _count: 5 },
    ] as never)
    vi.spyOn(statsModel, 'countAiGeneratedClientsInRange').mockResolvedValue(2)
    vi.spyOn(statsModel, 'countAiGeneratedOrdersInRange').mockResolvedValue(4)
    vi.spyOn(statsModel, 'findDeliveredOrdersByChannelInRange').mockResolvedValue([
      { channel: 'GMAIL', _sum: { price: new Prisma.Decimal(100) }, _count: 2 },
    ] as never)

    const dashboard = await getDashboard('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-02',
    })

    expect(dashboard.overview).toEqual({
      newClients: 5,
      ordersCreated: 12,
      averageDeliveryDays: null,
      revenue: '0',
    })
    expect(dashboard.ordersByStatus.total).toBe(3)
    expect(dashboard.ordersEvolution).toEqual({
      granularity: 'daily',
      points: [
        { date: '2026-10-01', count: 1 },
        { date: '2026-10-02', count: 0 },
      ],
    })
    expect(dashboard.clientsByType).toEqual({
      total: 5,
      types: [{ type: 'particular', count: 5, percentage: 100 }],
    })
    expect(dashboard.aiSummary).toEqual({ clientsDetected: 2, ordersDetected: 4 })
    expect(dashboard.channelPerformance).toEqual({
      entries: [{ channel: 'GMAIL', orderCount: 2, revenue: '100', averageTicket: '50' }],
    })
  })
})

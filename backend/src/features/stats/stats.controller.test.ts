import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { dashboard } from './stats.controller'
import * as statsService from './stats.service'

function createMockRequest(overrides: Record<string, unknown> = {}): Request {
  return overrides as unknown as Request
}

function createMockResponse() {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('dashboard', () => {
  // Given a date range
  // When requesting the dashboard
  // Then it should call the service with the business and range, and respond with the combined result
  it('returns the combined dashboard for the given business and date range', async () => {
    const dashboardResult = {
      overview: { newClients: 5, ordersCreated: 12, averageDeliveryDays: 2.5, revenue: '150' },
      ordersByStatus: {
        total: 10,
        statuses: [{ status: 'PENDING' as const, count: 3, percentage: 30 }],
      },
      ordersEvolution: {
        granularity: 'daily' as const,
        points: [{ date: '2026-10-01', count: 3 }],
      },
      clientsByType: {
        total: 5,
        types: [{ type: 'particular', count: 5, percentage: 100 }],
      },
      aiSummary: { clientsDetected: 2, ordersDetected: 4 },
    }
    const dashboardSpy = vi.spyOn(statsService, 'getDashboard').mockResolvedValue(dashboardResult)

    const req = createMockRequest({
      businessId: 'business-1',
      query: { dateFrom: '2026-10-01', dateTo: '2026-10-31' },
    })
    const res = createMockResponse()

    await dashboard(req, res, vi.fn() as NextFunction)

    expect(dashboardSpy).toHaveBeenCalledWith('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })
    expect(res.json).toHaveBeenCalledWith(dashboardResult)
  })

  // Given a granularity in the query string
  // When requesting the dashboard
  // Then it should be read and passed through to the service
  it('reads granularity from the query string', async () => {
    const dashboardSpy = vi.spyOn(statsService, 'getDashboard').mockResolvedValue({
      overview: { newClients: 0, ordersCreated: 0, averageDeliveryDays: null, revenue: '0' },
      ordersByStatus: { total: 0, statuses: [] },
      ordersEvolution: { granularity: 'weekly', points: [] },
      clientsByType: { total: 0, types: [] },
      aiSummary: { clientsDetected: 0, ordersDetected: 0 },
    })

    const req = createMockRequest({
      businessId: 'business-1',
      query: { dateFrom: '2026-10-01', dateTo: '2026-10-31', granularity: 'weekly' },
    })
    const res = createMockResponse()

    await dashboard(req, res, vi.fn() as NextFunction)

    expect(dashboardSpy).toHaveBeenCalledWith('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      granularity: 'weekly',
    })
  })
})

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
})

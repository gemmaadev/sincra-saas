import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { overview } from './stats.controller'
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

describe('overview', () => {
  // Given a date range
  // When requesting the overview
  // Then it should call the service with the business and range, and respond with it
  it('returns the overview for the given business and date range', async () => {
    const overviewResult = { newClients: 5, ordersCreated: 12, averageDeliveryDays: 2.5, revenue: '150' }
    const overviewSpy = vi.spyOn(statsService, 'getOverview').mockResolvedValue(overviewResult)

    const req = createMockRequest({
      businessId: 'business-1',
      query: { dateFrom: '2026-10-01', dateTo: '2026-10-31' },
    })
    const res = createMockResponse()

    await overview(req, res, vi.fn() as NextFunction)

    expect(overviewSpy).toHaveBeenCalledWith('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })
    expect(res.json).toHaveBeenCalledWith({ overview: overviewResult })
  })
})

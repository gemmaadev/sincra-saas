import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken } from '../../shared/jwt'
import * as statsService from './stats.service'

describe('stats routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const employeeCookie = `token=${signToken({ userId: 'emp-1', businessId: 'biz-1', role: 'EMPLOYEE' })}`

  describe('GET /stats/dashboard', () => {
    // Given an authenticated member and a date range in the query string
    // When requesting the dashboard
    // Then it should reach the service with that range and answer 200 with the combined result
    it('returns the combined dashboard for a date range', async () => {
      const dashboard = {
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
        channelPerformance: {
          entries: [{ channel: 'GMAIL' as const, orderCount: 2, revenue: '100', averageTicket: '50' }],
        },
      }
      vi.spyOn(statsService, 'getDashboard').mockResolvedValue(dashboard)

      const res = await request(app)
        .get('/stats/dashboard?dateFrom=2026-10-01&dateTo=2026-10-31')
        .set('Cookie', employeeCookie)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(dashboard)
      expect(statsService.getDashboard).toHaveBeenCalledWith('biz-1', {
        dateFrom: '2026-10-01',
        dateTo: '2026-10-31',
      })
    })

    // Given a granularity in the query string
    // When requesting the dashboard
    // Then it should be read and passed through to the service
    it('reads granularity from the query string', async () => {
      vi.spyOn(statsService, 'getDashboard').mockResolvedValue({
        overview: { newClients: 0, ordersCreated: 0, averageDeliveryDays: null, revenue: '0' },
        ordersByStatus: { total: 0, statuses: [] },
        ordersEvolution: { granularity: 'weekly', points: [] },
        clientsByType: { total: 0, types: [] },
        aiSummary: { clientsDetected: 0, ordersDetected: 0 },
        channelPerformance: { entries: [] },
      })

      await request(app)
        .get('/stats/dashboard?dateFrom=2026-10-01&dateTo=2026-10-31&granularity=weekly')
        .set('Cookie', employeeCookie)

      expect(statsService.getDashboard).toHaveBeenCalledWith('biz-1', {
        dateFrom: '2026-10-01',
        dateTo: '2026-10-31',
        granularity: 'weekly',
      })
    })

    // Given no session cookie
    // When requesting the dashboard
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const dashboardSpy = vi.spyOn(statsService, 'getDashboard')

      const res = await request(app).get('/stats/dashboard')

      expect(res.status).toBe(401)
      expect(dashboardSpy).not.toHaveBeenCalled()
    })
  })
})

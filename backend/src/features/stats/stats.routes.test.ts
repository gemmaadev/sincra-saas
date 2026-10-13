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

  describe('GET /stats/overview', () => {
    // Given an authenticated member and a date range in the query string
    // When requesting the overview
    // Then it should reach the service with that range and answer 200
    it('returns the overview for a date range', async () => {
      const overview = { newClients: 5, ordersCreated: 12, averageDeliveryDays: 2.5, revenue: '150' }
      vi.spyOn(statsService, 'getOverview').mockResolvedValue(overview)

      const res = await request(app)
        .get('/stats/overview?dateFrom=2026-10-01&dateTo=2026-10-31')
        .set('Cookie', employeeCookie)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ overview })
      expect(statsService.getOverview).toHaveBeenCalledWith('biz-1', {
        dateFrom: '2026-10-01',
        dateTo: '2026-10-31',
      })
    })

    // Given no session cookie
    // When requesting the overview
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const overviewSpy = vi.spyOn(statsService, 'getOverview')

      const res = await request(app).get('/stats/overview')

      expect(res.status).toBe(401)
      expect(overviewSpy).not.toHaveBeenCalled()
    })
  })
})

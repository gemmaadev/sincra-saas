import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken } from '../../shared/jwt'
import * as settingsService from './settings.service'
import { mockActiveMembership } from '../../shared/test/mockActiveMembership'

describe('settings routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockActiveMembership('ADMIN')
  })

  const adminCookie = `token=${signToken({ userId: 'admin-1', businessId: 'biz-1', role: 'ADMIN' })}`
  const employeeCookie = `token=${signToken({ userId: 'emp-1', businessId: 'biz-1', role: 'EMPLOYEE' })}`

  describe('POST /channels/connect', () => {
    // Given a request from an authenticated admin
    // When connecting a channel
    // Then it should reach the service and return 200
    it('connects a channel when the requester is an admin', async () => {
      vi.spyOn(settingsService, 'connectChannel').mockResolvedValue({} as never)

      const res = await request(app)
        .post('/channels/connect')
        .set('Cookie', adminCookie)
        .send({ channel: 'GMAIL' })

      expect(res.status).toBe(200)
      expect(settingsService.connectChannel).toHaveBeenCalledWith('biz-1', 'GMAIL', 'admin-1')
    })

    // Given a request from an authenticated employee (not an admin)
    // When trying to connect a channel
    // Then requireRole should reject it with 403 before it ever reaches the service
    it('returns 403 when the requester is an employee, not an admin', async () => {
      mockActiveMembership('EMPLOYEE')
      const connectSpy = vi.spyOn(settingsService, 'connectChannel')

      const res = await request(app)
        .post('/channels/connect')
        .set('Cookie', employeeCookie)
        .send({ channel: 'GMAIL' })

      expect(res.status).toBe(403)
      expect(connectSpy).not.toHaveBeenCalled()
    })

    // Given a request with no session cookie at all
    // When trying to connect a channel
    // Then verifyAuth should reject it before it ever reaches requireRole or the service
    it('returns 401 without a session cookie', async () => {
      const connectSpy = vi.spyOn(settingsService, 'connectChannel')

      const res = await request(app).post('/channels/connect').send({ channel: 'GMAIL' })

      expect(res.status).toBe(401)
      expect(connectSpy).not.toHaveBeenCalled()
    })
  })

  describe('POST /channels/disconnect', () => {
    // Given a request from an authenticated admin
    // When disconnecting a channel
    // Then it should reach the service and return 200
    it('disconnects a channel when the requester is an admin', async () => {
      vi.spyOn(settingsService, 'disconnectChannel').mockResolvedValue({} as never)

      const res = await request(app)
        .post('/channels/disconnect')
        .set('Cookie', adminCookie)
        .send({ channel: 'GMAIL' })

      expect(res.status).toBe(200)
      expect(settingsService.disconnectChannel).toHaveBeenCalledWith('biz-1', 'GMAIL', 'admin-1')
    })

    // Given a request from an employee
    // When trying to disconnect a channel
    // Then it should be rejected with 403
    it('returns 403 when the requester is an employee', async () => {
      mockActiveMembership('EMPLOYEE')
      const disconnectSpy = vi.spyOn(settingsService, 'disconnectChannel')

      const res = await request(app)
        .post('/channels/disconnect')
        .set('Cookie', employeeCookie)
        .send({ channel: 'GMAIL' })

      expect(res.status).toBe(403)
      expect(disconnectSpy).not.toHaveBeenCalled()
    })
  })

  describe('GET /settings/business', () => {
    // Given a request from any authenticated member (not just an admin)
    // When fetching business settings
    // Then it should reach the service and return 200
    it('reaches the service for any authenticated member', async () => {
      vi.spyOn(settingsService, 'getBusinessSettings').mockResolvedValue({} as never)

      const res = await request(app).get('/settings/business').set('Cookie', employeeCookie)

      expect(res.status).toBe(200)
      expect(settingsService.getBusinessSettings).toHaveBeenCalledWith('biz-1')
    })

    // Given a request with no session cookie
    // When fetching business settings
    // Then verifyAuth should reject it before it ever reaches the service
    it('returns 401 without a session cookie', async () => {
      const getSpy = vi.spyOn(settingsService, 'getBusinessSettings')

      const res = await request(app).get('/settings/business')

      expect(res.status).toBe(401)
      expect(getSpy).not.toHaveBeenCalled()
    })
  })

  describe('PATCH /settings/business', () => {
    // Given a request from an authenticated admin
    // When updating business settings
    // Then it should reach the service and return 200
    it('updates the business when the requester is an admin', async () => {
      vi.spyOn(settingsService, 'updateBusinessSettings').mockResolvedValue({} as never)

      const res = await request(app)
        .patch('/settings/business')
        .set('Cookie', adminCookie)
        .send({ name: 'Nuevo nombre' })

      expect(res.status).toBe(200)
      expect(settingsService.updateBusinessSettings).toHaveBeenCalledWith(
        'biz-1',
        { name: 'Nuevo nombre' },
        'admin-1',
      )
    })

    // Given a request from an employee (read-only for business settings)
    // When trying to update business settings
    // Then it should be rejected with 403
    it('returns 403 when the requester is an employee', async () => {
      mockActiveMembership('EMPLOYEE')
      const updateSpy = vi.spyOn(settingsService, 'updateBusinessSettings')

      const res = await request(app)
        .patch('/settings/business')
        .set('Cookie', employeeCookie)
        .send({ name: 'Nuevo nombre' })

      expect(res.status).toBe(403)
      expect(updateSpy).not.toHaveBeenCalled()
    })
  })

  describe('GET /settings/channels', () => {
    // Given a request from any authenticated member
    // When fetching the channels status
    // Then it should reach the service and return 200
    it('reaches the service for any authenticated member', async () => {
      vi.spyOn(settingsService, 'getConnectedChannelsStatus').mockResolvedValue([] as never)

      const res = await request(app).get('/settings/channels').set('Cookie', employeeCookie)

      expect(res.status).toBe(200)
      expect(settingsService.getConnectedChannelsStatus).toHaveBeenCalledWith('biz-1')
    })
  })

  describe('DELETE /settings/account', () => {
    // Given a request from an authenticated admin
    // When deleting the account
    // Then it should reach the service and return 200
    it('deletes the account when the requester is an admin', async () => {
      vi.spyOn(settingsService, 'deleteAccount').mockResolvedValue(undefined)

      const res = await request(app).delete('/settings/account').set('Cookie', adminCookie)

      expect(res.status).toBe(200)
      expect(settingsService.deleteAccount).toHaveBeenCalledWith('biz-1', 'admin-1')
    })

    // Given a request from an employee
    // When trying to delete the account
    // Then it should be rejected with 403 — only admins can delete the account
    it('returns 403 when the requester is an employee', async () => {
      mockActiveMembership('EMPLOYEE')
      const deleteSpy = vi.spyOn(settingsService, 'deleteAccount')

      const res = await request(app).delete('/settings/account').set('Cookie', employeeCookie)

      expect(res.status).toBe(403)
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    // Given a request with no session cookie
    // When trying to delete the account
    // Then verifyAuth should reject it before it ever reaches requireRole or the service
    it('returns 401 without a session cookie', async () => {
      const deleteSpy = vi.spyOn(settingsService, 'deleteAccount')

      const res = await request(app).delete('/settings/account')

      expect(res.status).toBe(401)
      expect(deleteSpy).not.toHaveBeenCalled()
    })
  })
})

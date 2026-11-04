import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken, signInvitationToken } from '../../shared/jwt'
import * as teamService from './team.service'
import { AppError } from '../../shared/AppError'
import { mockActiveMembership } from '../../shared/test/mockActiveMembership'

describe('team routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockActiveMembership('ADMIN')
  })

  const adminCookie = `token=${signToken({ userId: 'admin-1', businessId: 'biz-1', role: 'ADMIN' })}`
  const employeeCookie = `token=${signToken({ userId: 'emp-1', businessId: 'biz-1', role: 'EMPLOYEE' })}`

  describe('POST /team/invite', () => {
    // Given a request from an authenticated admin
    // When inviting a new team member
    // Then it should reach the service and return 201
    it('invites a new member when the requester is an admin', async () => {
      vi.spyOn(teamService, 'inviteMember').mockResolvedValue(undefined)

      const res = await request(app)
        .post('/team/invite')
        .set('Cookie', adminCookie)
        .send({ email: 'nuevo@test.com', name: 'Nuevo Empleado' })

      expect(res.status).toBe(201)
      expect(teamService.inviteMember).toHaveBeenCalledWith(
        'biz-1',
        'nuevo@test.com',
        'Nuevo Empleado',
      )
    })

    // Given a request from an authenticated employee (not an admin)
    // When trying to invite a new team member
    // Then requireRole should reject it with 403 before it ever reaches the service
    it('returns 403 when the requester is an employee, not an admin', async () => {
      mockActiveMembership('EMPLOYEE')
      const inviteSpy = vi.spyOn(teamService, 'inviteMember')

      const res = await request(app)
        .post('/team/invite')
        .set('Cookie', employeeCookie)
        .send({ email: 'nuevo@test.com', name: 'Nuevo Empleado' })

      expect(res.status).toBe(403)
      expect(inviteSpy).not.toHaveBeenCalled()
    })

    // Given a request with no session cookie at all
    // When trying to invite a new team member
    // Then verifyAuth should reject it before it ever reaches requireRole or the service
    it('returns 401 without a session cookie', async () => {
      const inviteSpy = vi.spyOn(teamService, 'inviteMember')

      const res = await request(app)
        .post('/team/invite')
        .send({ email: 'nuevo@test.com', name: 'Nuevo Empleado' })

      expect(res.status).toBe(401)
      expect(inviteSpy).not.toHaveBeenCalled()
    })
  })

  describe('POST /team/accept-invite', () => {
    // Given a valid, freshly signed invitation token
    // When accepting the invite
    // Then it should reach the service and return 200
    it('accepts the invite when the token is valid', async () => {
      vi.spyOn(teamService, 'acceptInvite').mockResolvedValue(undefined)
      const token = signInvitationToken({ userId: 'user-1', businessId: 'biz-1', invite: true })

      const res = await request(app)
        .post('/team/accept-invite')
        .send({ token, newPassword: 'nuevaPassword123' })

      expect(res.status).toBe(200)
      expect(teamService.acceptInvite).toHaveBeenCalledWith(token, 'nuevaPassword123')
    })

    // Given a token signed with an already-past expiration
    // When trying to accept the invite
    // Then it should propagate the service's 401 AppError
    it('returns 401 when the token has expired', async () => {
      const jwt = await import('jsonwebtoken')
      const expiredToken = jwt.sign(
        { userId: 'user-1', businessId: 'biz-1', invite: true },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' },
      )

      const res = await request(app)
        .post('/team/accept-invite')
        .send({ token: expiredToken, newPassword: 'nuevaPassword123' })

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('INVALID_TOKEN')
    })

    // Given no session cookie at all — accepting an invite happens before the user is logged in
    // When posting to accept-invite anyway
    // Then it should NOT be blocked by verifyAuth (this route is intentionally public)
    it('does not require a session cookie', async () => {
      vi.spyOn(teamService, 'acceptInvite').mockResolvedValue(undefined)
      const token = signInvitationToken({ userId: 'user-1', businessId: 'biz-1', invite: true })

      const res = await request(app).post('/team/accept-invite').send({ token })

      expect(res.status).toBe(200)
    })
  })

  describe('GET /team', () => {
    // Given a request with no session cookie
    // When listing team members
    // Then verifyAuth should reject it before it ever reaches the service
    it('returns 401 without a session cookie', async () => {
      const listSpy = vi.spyOn(teamService, 'listBusinessMembers')

      const res = await request(app).get('/team')

      expect(res.status).toBe(401)
      expect(listSpy).not.toHaveBeenCalled()
    })

    // Given a request from any authenticated member (not just an admin)
    // When listing team members
    // Then it should reach the service and return 200
    it('reaches the service for any authenticated member', async () => {
      mockActiveMembership('EMPLOYEE')
      vi.spyOn(teamService, 'listBusinessMembers').mockResolvedValue([])

      const res = await request(app).get('/team').set('Cookie', employeeCookie)

      expect(res.status).toBe(200)
      expect(teamService.listBusinessMembers).toHaveBeenCalledWith('biz-1')
    })
  })

  describe('PATCH /team/:userId/status', () => {
    // Given a request from an authenticated admin deactivating an employee
    // When updating that employee's status
    // Then it should reach the service and return 200
    it('deactivates an employee when the requester is an admin', async () => {
      vi.spyOn(teamService, 'updateMemberStatus').mockResolvedValue(undefined)

      const res = await request(app)
        .patch('/team/emp-1/status')
        .set('Cookie', adminCookie)
        .send({ status: 'INACTIVE' })

      expect(res.status).toBe(200)
      expect(teamService.updateMemberStatus).toHaveBeenCalledWith(
        'biz-1',
        'admin-1',
        'emp-1',
        'INACTIVE',
      )
    })

    // Given the requester is the only admin of the business, trying to deactivate themselves
    // When the service rejects that self-deactivation
    // Then the route should surface the service's 400 AppError
    it('returns 400 when the only admin tries to deactivate themselves', async () => {
      vi.spyOn(teamService, 'updateMemberStatus').mockRejectedValue(
        new AppError(
          'No puedes desactivar tu propio acceso siendo el único administrador del negocio',
          400,
          'LAST_ADMIN',
        ),
      )

      const res = await request(app)
        .patch('/team/admin-1/status')
        .set('Cookie', adminCookie)
        .send({ status: 'INACTIVE' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('LAST_ADMIN')
    })

    // Given a request from an authenticated employee (not an admin)
    // When trying to update a member's status
    // Then requireRole should reject it with 403 before it ever reaches the service
    it('returns 403 when the requester is an employee, not an admin', async () => {
      mockActiveMembership('EMPLOYEE')
      const updateSpy = vi.spyOn(teamService, 'updateMemberStatus')

      const res = await request(app)
        .patch('/team/emp-1/status')
        .set('Cookie', employeeCookie)
        .send({ status: 'INACTIVE' })

      expect(res.status).toBe(403)
      expect(updateSpy).not.toHaveBeenCalled()
    })

    // Given a request with no session cookie at all
    // When trying to update a member's status
    // Then verifyAuth should reject it before it ever reaches requireRole or the service
    it('returns 401 without a session cookie', async () => {
      const updateSpy = vi.spyOn(teamService, 'updateMemberStatus')

      const res = await request(app).patch('/team/emp-1/status').send({ status: 'INACTIVE' })

      expect(res.status).toBe(401)
      expect(updateSpy).not.toHaveBeenCalled()
    })
  })

  describe('POST /team/:userId/resend-invite', () => {
    // Given a request from an authenticated admin for a pending member
    // When resending their invite
    // Then it should reach the service and return 200
    it('resends the invite when the requester is an admin', async () => {
      vi.spyOn(teamService, 'resendInvite').mockResolvedValue(undefined)

      const res = await request(app)
        .post('/team/emp-1/resend-invite')
        .set('Cookie', adminCookie)

      expect(res.status).toBe(200)
      expect(teamService.resendInvite).toHaveBeenCalledWith('biz-1', 'emp-1')
    })

    // Given the target member already accepted their invite
    // When the service rejects the resend
    // Then the route should surface the service's 409 AppError
    it('returns 409 when the member already accepted the invite', async () => {
      vi.spyOn(teamService, 'resendInvite').mockRejectedValue(
        new AppError('Este miembro ya ha aceptado la invitación', 409, 'INVITE_ALREADY_ACCEPTED'),
      )

      const res = await request(app)
        .post('/team/emp-1/resend-invite')
        .set('Cookie', adminCookie)

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('INVITE_ALREADY_ACCEPTED')
    })

    // Given a request from an authenticated employee (not an admin)
    // When trying to resend an invite
    // Then requireRole should reject it with 403 before it ever reaches the service
    it('returns 403 when the requester is an employee, not an admin', async () => {
      mockActiveMembership('EMPLOYEE')
      const resendSpy = vi.spyOn(teamService, 'resendInvite')

      const res = await request(app)
        .post('/team/emp-1/resend-invite')
        .set('Cookie', employeeCookie)

      expect(res.status).toBe(403)
      expect(resendSpy).not.toHaveBeenCalled()
    })

    // Given a request with no session cookie at all
    // When trying to resend an invite
    // Then verifyAuth should reject it before it ever reaches requireRole or the service
    it('returns 401 without a session cookie', async () => {
      const resendSpy = vi.spyOn(teamService, 'resendInvite')

      const res = await request(app).post('/team/emp-1/resend-invite')

      expect(res.status).toBe(401)
      expect(resendSpy).not.toHaveBeenCalled()
    })
  })
})

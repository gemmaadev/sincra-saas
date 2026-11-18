import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken, signPendingToken, verifyToken } from '../../shared/jwt'
import * as authService from './auth.service'
import { mockActiveMembership } from '../../shared/test/mockActiveMembership'

describe('auth routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockActiveMembership()
  })

  const validCookie = `token=${signToken({ userId: 'user-1', businessId: 'biz-1', role: 'ADMIN' })}`
  const pendingCookie = `token=${signPendingToken({ userId: 'user-1', pending: true })}`

  describe('GET /auth/me (protected)', () => {
    // Given a request with no session cookie
    // When hitting /auth/me
    // Then verifyAuth should reject it before it ever reaches the service
    it('returns 401 without a session cookie', async () => {
      const meSpy = vi.spyOn(authService, 'findActiveMembershipWithDetails')

      const res = await request(app).get('/auth/me')

      expect(res.status).toBe(401)
      expect(meSpy).not.toHaveBeenCalled()
    })

    // Given a request with a valid session cookie
    // When hitting /auth/me
    // Then it should reach the service and return 200
    it('reaches the service when the session cookie is valid', async () => {
      vi.spyOn(authService, 'findActiveMembershipWithDetails').mockResolvedValue({
        role: 'ADMIN',
        user: { id: 'user-1', name: 'Laura', email: 'laura@test.com' },
        business: { id: 'biz-1', name: 'Tienda de Laura' },
      } as never)

      const res = await request(app).get('/auth/me').set('Cookie', validCookie)

      expect(res.status).toBe(200)
      expect(authService.findActiveMembershipWithDetails).toHaveBeenCalledWith('user-1', 'biz-1')
    })
  })

  describe('GET /users/me/businesses (protected by a pending token)', () => {
    // Given a request with no session cookie
    // When hitting /users/me/businesses
    // Then verifyPendingAuth should reject it before it ever reaches the service
    it('returns 401 without a session cookie', async () => {
      const businessesSpy = vi.spyOn(authService, 'getUserBusinesses')

      const res = await request(app).get('/users/me/businesses')

      expect(res.status).toBe(401)
      expect(businessesSpy).not.toHaveBeenCalled()
    })

    // Given a request with a pending token (issued mid multi-business login,
    // before the user has picked a business) — this route's actual use case
    // When hitting /users/me/businesses
    // Then it should reach the service and return 200
    it('reaches the service when the pending cookie is valid', async () => {
      vi.spyOn(authService, 'getUserBusinesses').mockResolvedValue([
        { businessId: 'biz-1', name: 'Tienda', sector: null, role: 'ADMIN' },
      ] as never)

      const res = await request(app).get('/users/me/businesses').set('Cookie', pendingCookie)

      expect(res.status).toBe(200)
      expect(authService.getUserBusinesses).toHaveBeenCalledWith('user-1')
    })

    // Given a request with a full session cookie instead of a pending one
    // When hitting /users/me/businesses
    // Then it should be rejected — this route only accepts the pending token issued
    // before a business is chosen, not a cookie that already has one selected
    it('returns 401 with a full session cookie instead of a pending one', async () => {
      const businessesSpy = vi.spyOn(authService, 'getUserBusinesses')

      const res = await request(app).get('/users/me/businesses').set('Cookie', validCookie)

      expect(res.status).toBe(401)
      expect(businessesSpy).not.toHaveBeenCalled()
    })
  })

  describe('GET /auth/me/businesses (protected by a full session)', () => {
    // Given a request with no session cookie
    // When listing businesses for the user menu
    // Then verifyAuth should reject it before it reaches the service
    it('returns 401 without a session cookie', async () => {
      const businessesSpy = vi.spyOn(authService, 'getUserBusinesses')

      const res = await request(app).get('/auth/me/businesses')

      expect(res.status).toBe(401)
      expect(businessesSpy).not.toHaveBeenCalled()
    })

    // Given a full session cookie
    // When listing businesses for the user menu
    // Then it should return the businesses of that user
    it('returns the businesses when the session cookie is valid', async () => {
      vi.spyOn(authService, 'getUserBusinesses').mockResolvedValue([
        { businessId: 'biz-1', name: 'Tienda A', sector: null, role: 'ADMIN' },
        { businessId: 'biz-2', name: 'Tienda B', sector: null, role: 'EMPLOYEE' },
      ] as never)

      const res = await request(app).get('/auth/me/businesses').set('Cookie', validCookie)

      expect(res.status).toBe(200)
      expect(authService.getUserBusinesses).toHaveBeenCalledWith('user-1')
      expect(res.body.businesses).toHaveLength(2)
    })

    // Given only the pending token issued before a business is chosen
    // When listing businesses on the authenticated route
    // Then it should be rejected — switching requires a full session
    it('returns 401 with a pending token', async () => {
      const businessesSpy = vi.spyOn(authService, 'getUserBusinesses')

      const res = await request(app).get('/auth/me/businesses').set('Cookie', pendingCookie)

      expect(res.status).toBe(401)
      expect(businessesSpy).not.toHaveBeenCalled()
    })
  })

  describe('POST /auth/switch-business (protected)', () => {
    // Given no session cookie
    // When trying to switch business
    // Then verifyAuth should reject it before checking membership
    it('returns 401 without a session cookie', async () => {
      const membershipSpy = vi.spyOn(authService, 'findMembership')

      const res = await request(app).post('/auth/switch-business').send({ businessId: 'biz-2' })

      expect(res.status).toBe(401)
      expect(membershipSpy).not.toHaveBeenCalled()
    })

    // Given a valid session and a membership in the target business
    // When switching to it
    // Then the response cookie should be a session for that business and its role
    it('sets a session cookie for the chosen business', async () => {
      vi.spyOn(authService, 'findMembership').mockResolvedValue({
        businessId: 'biz-2',
        userId: 'user-1',
        role: 'EMPLOYEE',
      } as never)

      const res = await request(app)
        .post('/auth/switch-business')
        .set('Cookie', validCookie)
        .send({ businessId: 'biz-2', role: 'ADMIN' })

      expect(res.status).toBe(200)
      expect(authService.findMembership).toHaveBeenCalledWith('user-1', 'biz-2')
      const setCookie = res.headers['set-cookie']
      const cookie = Array.isArray(setCookie) ? setCookie.join(';') : (setCookie ?? '')
      const token = cookie.match(/token=([^;]+)/)?.[1]
      expect(verifyToken(token!)).toMatchObject({
        userId: 'user-1',
        businessId: 'biz-2',
        role: 'EMPLOYEE',
      })
    })

    // Given a valid session but no membership in the target business
    // When switching to it
    // Then it should return 403 and not replace the session cookie
    it('returns 403 when the user does not belong to that business', async () => {
      vi.spyOn(authService, 'findMembership').mockResolvedValue(null)

      const res = await request(app)
        .post('/auth/switch-business')
        .set('Cookie', validCookie)
        .send({ businessId: 'biz-ajeno' })

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
      expect(res.headers['set-cookie']).toBeUndefined()
    })

    // Given a valid session and a body without a business id
    // When switching
    // Then it should return 400 before looking up a membership
    it('returns 400 when the business id is missing', async () => {
      const membershipSpy = vi.spyOn(authService, 'findMembership')

      const res = await request(app)
        .post('/auth/switch-business')
        .set('Cookie', validCookie)
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('MISSING_FIELDS')
      expect(membershipSpy).not.toHaveBeenCalled()
    })
  })

  describe('POST /auth/login (public)', () => {
    // Given a request with no session cookie at all (as any first-time visitor would have)
    // When logging in with valid credentials
    // Then it should reach the service and succeed, proving the route isn't accidentally
    // gated behind verifyAuth
    it('is reachable and succeeds without any prior session cookie', async () => {
      vi.spyOn(authService, 'findUserWithBusinesses').mockResolvedValue({
        id: 'user-1',
        passwordHash: 'hash-actual',
        memberships: [{ businessId: 'biz-1', role: 'ADMIN', business: { name: 'Tienda' } }],
      } as never)
      const hash = await import('../../shared/hash')
      vi.spyOn(hash, 'comparePassword').mockResolvedValue(true)

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'laura@test.com', password: '1234' })

      expect(res.status).toBe(200)
      expect(authService.findUserWithBusinesses).toHaveBeenCalledWith('laura@test.com')
    })
  })
})

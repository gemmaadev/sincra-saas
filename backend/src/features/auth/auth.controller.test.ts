import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { login, register, getMyBusinesses, selectBusiness, me } from './auth.controller'
import * as authService from './auth.service'
import { AppError } from '../../shared/AppError'

function createMockRequest(overrides: Record<string, unknown> = {}): Request {
  return overrides as unknown as Request
}

function createMockResponse() {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.cookie = vi.fn().mockReturnValue(res)
  return res
}

describe('login', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a user with one active business membership
  // When they log in with correct credentials
  // Then a full session cookie should be set and needsBusinessSelection should be false
  it('logs in directly when the user belongs to one business', async () => {
    vi.spyOn(authService, 'findUserWithBusinesses').mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hashed',
      memberships: [{ businessId: 'biz-1', role: 'ADMIN', business: { name: 'Tienda' } }],
    } as never)
    vi.spyOn(authService, 'comparePassword').mockResolvedValue(true)

    const req = createMockRequest({ body: { email: 'laura@test.com', password: '1234' } })
    const res = createMockResponse()

    await login(req, res, vi.fn() as NextFunction)

    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object))
    expect(res.json).toHaveBeenCalledWith({ needsBusinessSelection: false })
  })

  // Given a user with more than one active business membership
  // When they log in with correct credentials
  // Then the response should list their businesses instead of completing the session
  it('returns the business list when the user belongs to several businesses', async () => {
    vi.spyOn(authService, 'findUserWithBusinesses').mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hashed',
      memberships: [
        { businessId: 'biz-1', role: 'ADMIN', business: { name: 'Tienda A' } },
        { businessId: 'biz-2', role: 'EMPLOYEE', business: { name: 'Tienda B' } },
      ],
    } as never)
    vi.spyOn(authService, 'comparePassword').mockResolvedValue(true)

    const req = createMockRequest({ body: { email: 'laura@test.com', password: '1234' } })
    const res = createMockResponse()

    await login(req, res, vi.fn() as NextFunction)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ needsBusinessSelection: true }))
  })

  // Given an email that doesn't match any user
  // When trying to log in
  // Then it should throw a generic 401 error, without revealing whether the email exists
  it('throws a 401 AppError when the email does not exist', async () => {
    vi.spyOn(authService, 'findUserWithBusinesses').mockResolvedValue(null)

    const req = createMockRequest({ body: { email: 'no-existe@test.com', password: '1234' } })
    const res = createMockResponse()
    const next = vi.fn()

    await login(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })

  // Given a user with a wrong password
  // When trying to log in
  // Then it should throw the same generic 401 error as a non-existent email
  it('throws a 401 AppError when the password is incorrect', async () => {
    vi.spyOn(authService, 'findUserWithBusinesses').mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hashed',
      memberships: [],
    } as never)
    vi.spyOn(authService, 'comparePassword').mockResolvedValue(false)

    const req = createMockRequest({ body: { email: 'laura@test.com', password: 'incorrecta' } })
    const res = createMockResponse()
    const next = vi.fn()

    await login(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })

  // Given a user whose account has no business memberships at all
  // When trying to log in
  // Then it should throw a 403 AppError with the NO_BUSINESS code
  it('throws a 403 AppError when the user has no business memberships', async () => {
    vi.spyOn(authService, 'findUserWithBusinesses').mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hashed',
      memberships: [],
    } as never)
    vi.spyOn(authService, 'comparePassword').mockResolvedValue(true)

    const req = createMockRequest({ body: { email: 'laura@test.com', password: '1234' } })
    const res = createMockResponse()
    const next = vi.fn()

    await login(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(403)
  })

  // Given a user who signed up via social login only (no password set)
  // When trying to log in with email/password
  // Then it should throw the same generic 401 error, without revealing the account type
  it('throws a 401 AppError when the user has no password set (social login only)', async () => {
    vi.spyOn(authService, 'findUserWithBusinesses').mockResolvedValue({
      id: 'user-1',
      passwordHash: null,
      memberships: [],
    } as never)

    const req = createMockRequest({ body: { email: 'laura@test.com', password: '1234' } })
    const res = createMockResponse()
    const next = vi.fn()

    await login(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('register', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const validBody = {
    name: 'Laura',
    email: 'laura@test.com',
    password: 'password123',
    businessName: 'Tienda de Laura',
  }

  // Given valid registration data for an email that isn't taken yet
  // When registering a new business owner
  // Then it should create the account and set a full session cookie
  it('registers successfully and sets a session cookie', async () => {
    vi.spyOn(authService, 'findUserByEmail').mockResolvedValue(null)
    vi.spyOn(authService, 'registerBusinessOwner').mockResolvedValue({
      user: { id: 'user-1' },
      business: { id: 'biz-1' },
      membership: { role: 'ADMIN' },
    } as never)

    const req = createMockRequest({ body: validBody })
    const res = createMockResponse()

    await register(req, res, vi.fn() as NextFunction)

    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object))
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  // Given a request missing a required field
  // When trying to register
  // Then it should throw a 400 AppError without ever touching the database
  it('throws a 400 AppError when a required field is missing', async () => {
    const findUserByEmailSpy = vi.spyOn(authService, 'findUserByEmail')

    const req = createMockRequest({ body: { ...validBody, businessName: '' } })
    const res = createMockResponse()
    const next = vi.fn()

    await register(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('MISSING_FIELDS')
    expect(findUserByEmailSpy).not.toHaveBeenCalled()
  })

  // Given an email without a valid format
  // When trying to register
  // Then it should throw a 400 AppError with the INVALID_EMAIL code
  it('throws a 400 AppError when the email format is invalid', async () => {
    const req = createMockRequest({ body: { ...validBody, email: 'no-es-un-email' } })
    const res = createMockResponse()
    const next = vi.fn()

    await register(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('INVALID_EMAIL')
  })

  // Given a password shorter than 8 characters
  // When trying to register
  // Then it should throw a 400 AppError with the INVALID_PASSWORD code
  it('throws a 400 AppError when the password is too short', async () => {
    const req = createMockRequest({ body: { ...validBody, password: '1234' } })
    const res = createMockResponse()
    const next = vi.fn()

    await register(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('INVALID_PASSWORD')
  })

  // Given an email that already belongs to an existing account
  // When trying to register
  // Then it should throw a 409 AppError without creating anything
  it('throws a 409 AppError when the email is already taken', async () => {
    vi.spyOn(authService, 'findUserByEmail').mockResolvedValue({ id: 'user-existente' } as never)
    const registerBusinessOwnerSpy = vi.spyOn(authService, 'registerBusinessOwner')

    const req = createMockRequest({ body: validBody })
    const res = createMockResponse()
    const next = vi.fn()

    await register(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(409)
    expect(calledError.code).toBe('EMAIL_TAKEN')
    expect(registerBusinessOwnerSpy).not.toHaveBeenCalled()
  })
})

describe('getMyBusinesses', () => {
  // Given an authenticated request
  // When fetching the user's businesses
  // Then it should return the list from the service
  it('returns the businesses for the authenticated user', async () => {
    vi.spyOn(authService, 'getUserBusinesses').mockResolvedValue([
      { businessId: 'biz-1', name: 'Tienda', sector: null, role: 'ADMIN' },
    ] as never)

    const req = createMockRequest({ userId: 'user-1' })
    const res = createMockResponse()

    await getMyBusinesses(req, res, vi.fn() as NextFunction)

    expect(res.json).toHaveBeenCalledWith({
      businesses: [{ businessId: 'biz-1', name: 'Tienda', sector: null, role: 'ADMIN' }],
    })
  })
})

describe('selectBusiness', () => {
  // Given a valid pending token and a business the user belongs to
  // When selecting that business
  // Then a full session cookie should be set
  it('sets a full session cookie when the membership is valid', async () => {
    const { signPendingToken } = await import('../../shared/jwt')
    const pendingToken = signPendingToken({ userId: 'user-1', pending: true })

    vi.spyOn(authService, 'findMembership').mockResolvedValue({
      businessId: 'biz-1',
      userId: 'user-1',
      role: 'ADMIN',
    } as never)

    const req = createMockRequest({
      body: { businessId: 'biz-1' },
      cookies: { token: pendingToken },
    })
    const res = createMockResponse()

    await selectBusiness(req, res, vi.fn() as NextFunction)

    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object))
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  // Given a businessId the user does not belong to
  // When selecting that business
  // Then it should throw a 403 AppError
  it('throws a 403 AppError when the user does not belong to that business', async () => {
    const { signPendingToken } = await import('../../shared/jwt')
    const pendingToken = signPendingToken({ userId: 'user-1', pending: true })

    vi.spyOn(authService, 'findMembership').mockResolvedValue(null)

    const req = createMockRequest({
      body: { businessId: 'biz-ajeno' },
      cookies: { token: pendingToken },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await selectBusiness(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })

  // Given no pending token cookie at all
  // When trying to select a business
  // Then it should throw a 401 AppError
  it('throws a 401 AppError when there is no pending token cookie', async () => {
    const req = createMockRequest({ body: { businessId: 'biz-1' }, cookies: {} })
    const res = createMockResponse()
    const next = vi.fn()

    await selectBusiness(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })

  // Given an invalid or expired pending token
  // When trying to select a business
  // Then it should throw a 401 AppError
  it('throws a 401 AppError when the pending token is invalid', async () => {
    const req = createMockRequest({
      body: { businessId: 'biz-1' },
      cookies: { token: 'token-falso-no-valido' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await selectBusiness(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('me', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a request that already carries a valid session (userId/businessId
  // injected by verifyAuth after decoding the cookie) and an active membership
  // When fetching the authenticated user
  // Then it should return the user, business and role
  it('returns the authenticated user when the session is valid', async () => {
    vi.spyOn(authService, 'findActiveMembershipWithDetails').mockResolvedValue({
      role: 'ADMIN',
      user: { id: 'user-1', name: 'Laura', email: 'laura@test.com' },
      business: { id: 'biz-1', name: 'Tienda de Laura' },
    } as never)

    const req = createMockRequest({ userId: 'user-1', businessId: 'biz-1' })
    const res = createMockResponse()

    await me(req, res, vi.fn() as NextFunction)

    expect(res.json).toHaveBeenCalledWith({
      user: { id: 'user-1', name: 'Laura', email: 'laura@test.com' },
      business: { id: 'biz-1', name: 'Tienda de Laura' },
      role: 'ADMIN',
    })
  })

  // Given a request with no valid session (no cookie was ever decoded into
  // req.userId/businessId, or the membership behind it no longer exists)
  // When fetching the authenticated user
  // Then it should throw a 401 AppError instead of returning any data
  it('throws a 401 AppError when there is no valid session', async () => {
    vi.spyOn(authService, 'findActiveMembershipWithDetails').mockResolvedValue(null)

    const req = createMockRequest()
    const res = createMockResponse()
    const next = vi.fn()

    await me(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(401)
  })
})

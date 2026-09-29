import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import * as hashService from '../../shared/hash'

import {
  login,
  register,
  getMyBusinesses,
  selectBusiness,
  me,
  loginWithGoogle,
  completeOnboarding,
  startMicrosoftAuth,
  microsoftCallback,
  forgotPassword,
  resetPasswordHandler,
} from './auth.controller'
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
  res.redirect = vi.fn().mockReturnValue(res)
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
    vi.spyOn(hashService, 'comparePassword').mockResolvedValue(true)

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
    vi.spyOn(hashService, 'comparePassword').mockResolvedValue(true)

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
    vi.spyOn(hashService, 'comparePassword').mockResolvedValue(false)

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
    vi.spyOn(hashService, 'comparePassword').mockResolvedValue(true)

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

describe('loginWithGoogle', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid Google idToken for a brand new user
  // When they log in with Google for the first time
  // Then a pending token should be set and needsOnboarding should be true
  it('flags needsOnboarding when the Google user has no business yet', async () => {
    vi.spyOn(authService, 'verifyGoogleToken').mockResolvedValue({
      email: 'nuevo@test.com',
      name: 'Nuevo Usuario',
      googleId: 'google-123',
    } as never)
    vi.spyOn(authService, 'findOrCreateSocialUser').mockResolvedValue({
      id: 'user-1',
      memberships: [],
    } as never)

    const req = createMockRequest({ body: { idToken: 'valid-google-token' } })
    const res = createMockResponse()

    await loginWithGoogle(req, res, vi.fn() as NextFunction)

    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object))
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ needsOnboarding: true, needsBusinessSelection: false }),
    )
  })

  // Given a Google user who already belongs to exactly one business
  // When they log in with Google
  // Then a full session cookie should be set, with no onboarding or business selection needed
  it('logs in directly when the Google user belongs to one business', async () => {
    vi.spyOn(authService, 'verifyGoogleToken').mockResolvedValue({
      email: 'laura@test.com',
      name: 'Laura',
      googleId: 'google-456',
    } as never)
    vi.spyOn(authService, 'findOrCreateSocialUser').mockResolvedValue({
      id: 'user-2',
      memberships: [{ businessId: 'biz-1', role: 'ADMIN', business: { name: 'Tienda' } }],
    } as never)

    const req = createMockRequest({ body: { idToken: 'valid-google-token' } })
    const res = createMockResponse()

    await loginWithGoogle(req, res, vi.fn() as NextFunction)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ needsOnboarding: false, needsBusinessSelection: false }),
    )
  })

  // Given a Google user who belongs to more than one business
  // When they log in with Google
  // Then the response should list their businesses for selection
  it('returns the business list when the Google user belongs to several businesses', async () => {
    vi.spyOn(authService, 'verifyGoogleToken').mockResolvedValue({
      email: 'laura@test.com',
      name: 'Laura',
      googleId: 'google-456',
    } as never)
    vi.spyOn(authService, 'findOrCreateSocialUser').mockResolvedValue({
      id: 'user-2',
      memberships: [
        { businessId: 'biz-1', role: 'ADMIN', business: { name: 'Tienda A' } },
        { businessId: 'biz-2', role: 'EMPLOYEE', business: { name: 'Tienda B' } },
      ],
    } as never)

    const req = createMockRequest({ body: { idToken: 'valid-google-token' } })
    const res = createMockResponse()

    await loginWithGoogle(req, res, vi.fn() as NextFunction)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ needsBusinessSelection: true }))
  })

  // Given a request with no idToken at all
  // When trying to log in with Google
  // Then it should throw a 400 AppError
  it('throws a 400 AppError when idToken is missing', async () => {
    const req = createMockRequest({ body: {} })
    const res = createMockResponse()
    const next = vi.fn()

    await loginWithGoogle(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })

  // Given an idToken that Google's verification rejects
  // When trying to log in with Google
  // Then it should throw a 401 AppError, without leaking the underlying verification error
  it('throws a 401 AppError when the Google token cannot be verified', async () => {
    vi.spyOn(authService, 'verifyGoogleToken').mockRejectedValue(new Error('invalid token'))

    const req = createMockRequest({ body: { idToken: 'bad-token' } })
    const res = createMockResponse()
    const next = vi.fn()

    await loginWithGoogle(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('completeOnboarding', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid pending token from a social login with no business yet
  // When the user completes onboarding with a business name
  // Then a full session cookie should be set
  it('creates the business and sets a full session cookie', async () => {
    const { signPendingToken } = await import('../../shared/jwt')
    const pendingToken = signPendingToken({ userId: 'user-1', pending: true })

    vi.spyOn(authService, 'completeOnboardingForUser').mockResolvedValue({
      business: { id: 'biz-new' },
      membership: { role: 'ADMIN' },
    } as never)

    const req = createMockRequest({
      body: { businessName: 'Mi Negocio Nuevo' },
      cookies: { token: pendingToken },
    })
    const res = createMockResponse()

    await completeOnboarding(req, res, vi.fn() as NextFunction)

    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object))
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  // Given no pending token cookie at all
  // When trying to complete onboarding
  // Then it should throw a 401 AppError
  it('throws a 401 AppError when there is no pending token cookie', async () => {
    const req = createMockRequest({ body: { businessName: 'Mi Negocio' }, cookies: {} })
    const res = createMockResponse()
    const next = vi.fn()

    await completeOnboarding(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })

  // Given an invalid or expired pending token
  // When trying to complete onboarding
  // Then it should throw a 401 AppError
  it('throws a 401 AppError when the pending token is invalid', async () => {
    const req = createMockRequest({
      body: { businessName: 'Mi Negocio' },
      cookies: { token: 'token-falso-no-valido' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await completeOnboarding(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })

  // Given a valid pending token but no businessName in the body
  // When trying to complete onboarding
  // Then it should throw a 400 AppError
  it('throws a 400 AppError when businessName is missing', async () => {
    const { signPendingToken } = await import('../../shared/jwt')
    const pendingToken = signPendingToken({ userId: 'user-1', pending: true })

    const req = createMockRequest({ body: {}, cookies: { token: pendingToken } })
    const res = createMockResponse()
    const next = vi.fn()

    await completeOnboarding(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('startMicrosoftAuth', () => {
  beforeEach(() => {
    vi.stubEnv('MICROSOFT_CLIENT_ID', 'test-client-id')
    vi.stubEnv('MICROSOFT_REDIRECT_URI', 'http://localhost:3000/auth/microsoft/callback')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // Given a request to start the Microsoft login flow
  // When the user clicks the Microsoft button
  // Then it should redirect to Microsoft's own authorize endpoint with the configured client id and redirect uri
  it('redirects to the Microsoft authorize endpoint with the configured client id and redirect uri', async () => {
    const req = createMockRequest()
    const res = createMockResponse()

    await startMicrosoftAuth(req, res, vi.fn() as NextFunction)

    expect(res.redirect).toHaveBeenCalledTimes(1)
    const redirectUrl = new URL(String(vi.mocked(res.redirect).mock.calls[0][0]))
    expect(redirectUrl.origin + redirectUrl.pathname).toBe(
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    )
    expect(redirectUrl.searchParams.get('client_id')).toBe('test-client-id')
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/auth/microsoft/callback',
    )
    expect(redirectUrl.searchParams.get('response_type')).toBe('code')
  })
})

describe('microsoftCallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // Given a callback request with no authorization code (Microsoft sent an error instead,
  // e.g. the user cancelled the consent screen)
  // When handling the callback
  // Then it should throw a 400 AppError instead of trying to exchange an empty code
  it('throws a 400 AppError when the callback has no authorization code', async () => {
    const exchangeSpy = vi.spyOn(authService, 'exchangeMicrosoftCode')

    const req = createMockRequest({ query: { error: 'access_denied' } })
    const res = createMockResponse()
    const next = vi.fn()

    await microsoftCallback(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('MISSING_CODE')
    expect(exchangeSpy).not.toHaveBeenCalled()
  })

  // Given an authorization code that Microsoft's token endpoint rejects
  // When handling the callback
  // Then it should throw a 401 AppError, without leaking the underlying error
  it('throws a 401 AppError when the code cannot be exchanged', async () => {
    vi.spyOn(authService, 'exchangeMicrosoftCode').mockRejectedValue(new Error('invalid_grant'))

    const req = createMockRequest({ query: { code: 'expired-code' } })
    const res = createMockResponse()
    const next = vi.fn()

    await microsoftCallback(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(401)
    expect(calledError.code).toBe('INVALID_TOKEN')
  })

  // Given a valid code for a brand new user with no business yet
  // When handling the callback
  // Then it should set a pending token cookie and redirect to /onboarding
  it('redirects to /onboarding when the Microsoft user has no business yet', async () => {
    vi.spyOn(authService, 'exchangeMicrosoftCode').mockResolvedValue({
      email: 'nuevo@outlook.com',
      name: 'Nuevo Usuario',
      microsoftId: 'ms-123',
    })
    vi.spyOn(authService, 'findOrCreateSocialUser').mockResolvedValue({
      id: 'user-3',
      memberships: [],
    } as never)

    const req = createMockRequest({ query: { code: 'valid-code' } })
    const res = createMockResponse()

    await microsoftCallback(req, res, vi.fn() as NextFunction)

    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object))
    expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/onboarding')
  })

  // Given a valid code for a user who already belongs to exactly one business
  // When handling the callback
  // Then it should set a full session cookie and redirect straight to /inbox
  it('redirects to /inbox when the Microsoft user belongs to one business', async () => {
    vi.spyOn(authService, 'exchangeMicrosoftCode').mockResolvedValue({
      email: 'laura@outlook.com',
      name: 'Laura',
      microsoftId: 'ms-456',
    })
    vi.spyOn(authService, 'findOrCreateSocialUser').mockResolvedValue({
      id: 'user-4',
      memberships: [{ businessId: 'biz-1', role: 'ADMIN', business: { name: 'Tienda' } }],
    } as never)

    const req = createMockRequest({ query: { code: 'valid-code' } })
    const res = createMockResponse()

    await microsoftCallback(req, res, vi.fn() as NextFunction)

    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object))
    expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/inbox')
  })

  // Given a valid code for a user who belongs to more than one business
  // When handling the callback
  // Then it should set a pending token cookie and redirect to /select-business
  it('redirects to /select-business when the Microsoft user belongs to several businesses', async () => {
    vi.spyOn(authService, 'exchangeMicrosoftCode').mockResolvedValue({
      email: 'laura@outlook.com',
      name: 'Laura',
      microsoftId: 'ms-456',
    })
    vi.spyOn(authService, 'findOrCreateSocialUser').mockResolvedValue({
      id: 'user-4',
      memberships: [
        { businessId: 'biz-1', role: 'ADMIN', business: { name: 'Tienda A' } },
        { businessId: 'biz-2', role: 'EMPLOYEE', business: { name: 'Tienda B' } },
      ],
    } as never)

    const req = createMockRequest({ query: { code: 'valid-code' } })
    const res = createMockResponse()

    await microsoftCallback(req, res, vi.fn() as NextFunction)

    expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/select-business')
  })
})

describe('forgotPassword', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid email
  // When requesting a password reset
  // Then it should call the service and respond with success: true
  it('calls requestPasswordReset and responds with success: true', async () => {
    const requestSpy = vi.spyOn(authService, 'requestPasswordReset').mockResolvedValue(undefined)

    const req = createMockRequest({ body: { email: 'laura@test.com' } })
    const res = createMockResponse()

    await forgotPassword(req, res, vi.fn() as NextFunction)

    expect(requestSpy).toHaveBeenCalledWith('laura@test.com')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  // Given a request with no email at all
  // When trying to request a password reset
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when email is missing', async () => {
    const requestSpy = vi.spyOn(authService, 'requestPasswordReset')

    const req = createMockRequest({ body: {} })
    const res = createMockResponse()
    const next = vi.fn()

    await forgotPassword(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('MISSING_FIELDS')
    expect(requestSpy).not.toHaveBeenCalled()
  })

  // Given an email that doesn't match any user (or the email provider fails)
  // When requesting a password reset
  // Then it should still respond with success: true, without revealing anything went wrong
  it('responds with success: true even when the service throws', async () => {
    vi.spyOn(authService, 'requestPasswordReset').mockRejectedValue(new Error('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const req = createMockRequest({ body: { email: 'no-existe@test.com' } })
    const res = createMockResponse()

    await forgotPassword(req, res, vi.fn() as NextFunction)

    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})

describe('resetPasswordHandler', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid, unexpired, unused token and a strong enough new password
  // When resetting the password
  // Then it should call the service and respond with success: true
  it('calls resetPassword and responds with success: true', async () => {
    const resetSpy = vi.spyOn(authService, 'resetPassword').mockResolvedValue(undefined)

    const req = createMockRequest({
      body: { token: 'valid-token', newPassword: 'newpassword123' },
    })
    const res = createMockResponse()

    await resetPasswordHandler(req, res, vi.fn() as NextFunction)

    expect(resetSpy).toHaveBeenCalledWith('valid-token', 'newpassword123')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  // Given a request missing the token or the new password
  // When trying to reset the password
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when token or newPassword is missing', async () => {
    const resetSpy = vi.spyOn(authService, 'resetPassword')

    const req = createMockRequest({ body: { token: 'valid-token' } })
    const res = createMockResponse()
    const next = vi.fn()

    await resetPasswordHandler(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('MISSING_FIELDS')
    expect(resetSpy).not.toHaveBeenCalled()
  })

  // Given a new password shorter than 8 characters
  // When trying to reset the password
  // Then it should throw a 400 AppError with the INVALID_PASSWORD code
  it('throws a 400 AppError when the new password is too short', async () => {
    const req = createMockRequest({ body: { token: 'valid-token', newPassword: '1234' } })
    const res = createMockResponse()
    const next = vi.fn()

    await resetPasswordHandler(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('INVALID_PASSWORD')
  })

  // Given a token that doesn't exist, has already been used, or has expired
  // When trying to reset the password
  // Then it should throw a 400 AppError with the INVALID_TOKEN code
  it('throws a 400 AppError when the service rejects the token', async () => {
    vi.spyOn(authService, 'resetPassword').mockRejectedValue(new Error('Este enlace ha caducado'))

    const req = createMockRequest({
      body: { token: 'expired-token', newPassword: 'newpassword123' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await resetPasswordHandler(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('INVALID_TOKEN')
  })
})

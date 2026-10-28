import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { verifyAuth } from './verifyAuth'
import { signToken, signPendingToken } from '../shared/jwt'
import { AppError } from '../shared/AppError'
import * as authModel from '../features/auth/auth.model'

vi.mock('../features/auth/auth.model')

function createMockRequest(token?: string): Request {
  return { cookies: token ? { token } : {} } as Request
}

describe('verifyAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Given a request with a valid JWT cookie and a still-active membership
  // When it passes through verifyAuth
  // Then it should inject userId/businessId/role (from the live membership, not the token) and call next()
  it('injects userId, businessId and the current role, and calls next() with a valid token', async () => {
    vi.mocked(authModel.findActiveMembership).mockResolvedValue({ role: 'ADMIN' } as never)
    const token = signToken({ userId: '1', businessId: 'biz-1', role: 'EMPLOYEE' })
    const req = createMockRequest(token)
    const next = vi.fn() as NextFunction

    await verifyAuth(req, {} as Response, next)

    expect(authModel.findActiveMembership).toHaveBeenCalledWith('1', 'biz-1')
    expect(req.userId).toBe('1')
    expect(req.businessId).toBe('biz-1')
    expect(req.role).toBe('ADMIN')
    expect(next).toHaveBeenCalledOnce()
    expect(next).toHaveBeenCalledWith()
  })

  // Given a valid token for a member who has since been deactivated (or whose
  // business was soft-deleted), so no active membership is found anymore
  // When it passes through verifyAuth
  // Then it should call next() with a 401 AppError instead of trusting the token's stale payload
  it('calls next() with a 401 AppError when the membership is no longer active', async () => {
    vi.mocked(authModel.findActiveMembership).mockResolvedValue(null)
    const token = signToken({ userId: '1', businessId: 'biz-1', role: 'ADMIN' })
    const req = createMockRequest(token)
    const next = vi.fn()

    await verifyAuth(req, {} as Response, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const error = next.mock.calls[0][0] as AppError
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
    expect(req.userId).toBeUndefined()
  })

  // Given a request with an invalid/tampered JWT cookie
  // When it passes through verifyAuth
  // Then it should call next() with a 401 AppError, without ever checking the membership
  it('calls next() with a 401 AppError with an invalid token', async () => {
    const req = createMockRequest('token-falso-no-valido')
    const next = vi.fn()

    await verifyAuth(req, {} as Response, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect(authModel.findActiveMembership).not.toHaveBeenCalled()
  })

  // Given a request with no token at all
  // When it passes through verifyAuth
  // Then it should call next() with a 401 AppError
  it('calls next() with a 401 AppError with no token', async () => {
    const req = createMockRequest()
    const next = vi.fn()

    await verifyAuth(req, {} as Response, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })

  // Given a request carrying a pending token (issued mid multi-business login,
  // before the user picked a business) instead of a full session token
  // When it passes through verifyAuth, which protects routes that need a full session
  // Then it should call next() with a 401 AppError instead of injecting undefined businessId/role
  it('calls next() with a 401 AppError with a pending token instead of a full session token', async () => {
    const pendingToken = signPendingToken({ userId: '1', pending: true })
    const req = createMockRequest(pendingToken)
    const next = vi.fn()

    await verifyAuth(req, {} as Response, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const error = next.mock.calls[0][0] as AppError
    expect(error.statusCode).toBe(401)
  })
})

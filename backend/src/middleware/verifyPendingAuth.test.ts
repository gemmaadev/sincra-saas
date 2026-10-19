import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { verifyPendingAuth } from './verifyPendingAuth'
import { signToken, signPendingToken } from '../shared/jwt'
import { AppError } from '../shared/AppError'

function createMockRequest(token?: string): Request {
  return { cookies: token ? { token } : {} } as Request
}

describe('verifyPendingAuth', () => {
  // Given a request with a valid pending JWT cookie
  // When it passes through verifyPendingAuth
  // Then it should inject userId into the request and call next()
  it('injects userId and calls next() with a valid pending token', () => {
    const token = signPendingToken({ userId: '1', pending: true })
    const req = createMockRequest(token)
    const next = vi.fn() as NextFunction

    verifyPendingAuth(req, {} as Response, next)

    expect(req.userId).toBe('1')
    expect(next).toHaveBeenCalledOnce()
  })

  // Given a request with a full session token instead of a pending one
  // When it passes through verifyPendingAuth, which protects the pre-business-selection flow
  // Then it should throw a 401 AppError
  it('throws a 401 AppError with a full session token instead of a pending one', () => {
    const fullToken = signToken({ userId: '1', businessId: 'biz-1', role: 'ADMIN' })
    const req = createMockRequest(fullToken)

    expect(() => verifyPendingAuth(req, {} as Response, vi.fn() as NextFunction)).toThrow(AppError)
    try {
      verifyPendingAuth(req, {} as Response, vi.fn() as NextFunction)
    } catch (error) {
      expect((error as AppError).statusCode).toBe(401)
    }
  })

  // Given a request with an invalid/tampered JWT cookie
  // When it passes through verifyPendingAuth
  // Then it should throw a 401 AppError
  it('throws a 401 AppError with an invalid token', () => {
    const req = createMockRequest('token-falso-no-valido')

    expect(() => verifyPendingAuth(req, {} as Response, vi.fn() as NextFunction)).toThrow(AppError)
  })

  // Given a request with no token at all
  // When it passes through verifyPendingAuth
  // Then it should throw a 401 AppError
  it('throws a 401 AppError with no token', () => {
    const req = createMockRequest()

    expect(() => verifyPendingAuth(req, {} as Response, vi.fn() as NextFunction)).toThrow(AppError)
  })
})

import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { verifyAuth } from './verifyAuth'
import { signToken } from '../shared/jwt'
import { AppError } from '../shared/errors/AppError'

function createMockRequest(token?: string): Request {
  return { cookies: token ? { token } : {} } as Request
}

describe('verifyAuth', () => {
  // Given a request with a valid JWT cookie
  // When it passes through verifyAuth
  // Then it should inject userId/role into the request and call next()
  it('injects userId and role, and calls next() with a valid token', () => {
    const token = signToken({ userId: '1', role: 'admin' })
    const req = createMockRequest(token)
    const next = vi.fn() as NextFunction

    verifyAuth(req, {} as Response, next)

    expect(req.userId).toBe('1')
    expect(req.role).toBe('admin')
    expect(next).toHaveBeenCalledOnce()
  })

  // Given a request with an invalid/tampered JWT cookie
  // When it passes through verifyAuth
  // Then it should throw a 401 AppError
  it('throws a 401 AppError with an invalid token', () => {
    const req = createMockRequest('token-falso-no-valido')

    expect(() => verifyAuth(req, {} as Response, vi.fn() as NextFunction)).toThrow(AppError)
    try {
      verifyAuth(req, {} as Response, vi.fn() as NextFunction)
    } catch (error) {
      expect((error as AppError).statusCode).toBe(401)
    }
  })

  // Given a request with no token at all
  // When it passes through verifyAuth
  // Then it should throw a 401 AppError
  it('throws a 401 AppError with no token', () => {
    const req = createMockRequest()

    expect(() => verifyAuth(req, {} as Response, vi.fn() as NextFunction)).toThrow(AppError)
  })
})

import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { requireRole } from './requireRole'
import { AppError } from '../shared/AppError'

describe('requireRole', () => {
  // Given a request from a user with the required role
  // When it passes through requireRole
  // Then it should call next()
  it('calls next() when the user has the required role', () => {
    const req = { role: 'ADMIN' } as Request
    const next = vi.fn() as NextFunction

    requireRole('ADMIN')(req, {} as Response, next)

    expect(next).toHaveBeenCalledOnce()
  })

  // Given a request from a user without the required role
  // When it passes through requireRole
  // Then it should throw a 403 AppError
  it('throws a 403 AppError when the user does not have the required role', () => {
    const req = { role: 'EMPLOYEE' } as Request

    expect(() => requireRole('ADMIN')(req, {} as Response, vi.fn() as NextFunction)).toThrow(
      AppError,
    )
    try {
      requireRole('ADMIN')(req, {} as Response, vi.fn() as NextFunction)
    } catch (error) {
      expect((error as AppError).statusCode).toBe(403)
    }
  })
})

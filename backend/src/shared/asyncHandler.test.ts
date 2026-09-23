// src/shared/asyncHandler.test.ts
import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { asyncHandler } from './asyncHandler'

describe('asyncHandler', () => {
  // Given an async controller that resolves normally
  // When it is wrapped with asyncHandler and called
  // Then it should run without calling next() with an error
  it('runs the controller normally when it resolves', async () => {
    const controller = vi.fn(async (req: Request, res: Response) => {
      res.json({ ok: true })
    })
    const res = { json: vi.fn() } as unknown as Response
    const next = vi.fn() as NextFunction

    await asyncHandler(controller)({} as Request, res, next)

    expect(res.json).toHaveBeenCalledWith({ ok: true })
    expect(next).not.toHaveBeenCalled()
  })

  // Given an async controller that throws an error
  // When it is wrapped with asyncHandler and called
  // Then the error should be passed to next(), not swallowed
  it('propagates a thrown error to next()', async () => {
    const error = new Error('Algo falló')
    const controller = vi.fn(async () => {
      throw error
    })
    const next = vi.fn() as NextFunction

    await asyncHandler(controller)({} as Request, {} as Response, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})

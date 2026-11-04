import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../shared/jwt'
import { AppError } from '../shared/AppError'
import { findActiveMembership } from '../features/auth/auth.model'
import { asyncHandler } from '../shared/handlers/asyncHandler'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string
      businessId?: string
      role?: 'ADMIN' | 'EMPLOYEE'
    }
  }
}

export const verifyAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token

  if (!token) {
    throw new AppError('No has iniciado sesión', 401, 'UNAUTHORIZED')
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw new AppError('Sesión no válida o expirada', 401, 'UNAUTHORIZED')
  }

  // Re-check membership on every request so a deactivation revokes access immediately.
  const membership = await findActiveMembership(payload.userId, payload.businessId)

  if (!membership) {
    throw new AppError('Tu sesión ya no es válida', 401, 'UNAUTHORIZED')
  }

  req.userId = payload.userId
  req.businessId = payload.businessId
  req.role = membership.role
  next()
})

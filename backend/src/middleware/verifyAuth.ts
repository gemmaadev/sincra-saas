import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../shared/jwt'
import { AppError } from '../shared/AppError'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string
      role?: 'admin' | 'employee'
    }
  }
}

export function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token

  if (!token) {
    throw new AppError('No has iniciado sesión', 401, 'UNAUTHORIZED')
  }

  try {
    const payload = verifyToken(token)
    req.userId = payload.userId
    req.role = payload.role
    next()
  } catch {
    throw new AppError('Sesión no válida o expirada', 401, 'UNAUTHORIZED')
  }
}

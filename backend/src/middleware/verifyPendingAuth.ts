import type { Request, Response, NextFunction } from 'express'
import { verifyPendingToken } from '../shared/jwt'
import { AppError } from '../shared/AppError'

export function verifyPendingAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token

  if (!token) {
    throw new AppError('No has iniciado sesión', 401, 'UNAUTHORIZED')
  }

  try {
    const payload = verifyPendingToken(token)
    req.userId = payload.userId
    next()
  } catch {
    throw new AppError('Sesión no válida o expirada', 401, 'UNAUTHORIZED')
  }
}

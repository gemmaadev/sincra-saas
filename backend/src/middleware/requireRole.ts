import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../shared/errors/AppError'

export function requireRole(role: 'admin' | 'employee') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.role !== role) {
      throw new AppError('No tienes permiso para realizar esta acción', 403, 'FORBIDDEN')
    }
    next()
  }
}

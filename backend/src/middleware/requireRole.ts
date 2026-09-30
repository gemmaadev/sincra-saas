import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../shared/AppError'

export function requireRole(role: 'ADMIN' | 'EMPLOYEE') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.role !== role) {
      throw new AppError('No tienes permiso para realizar esta acción', 403, 'FORBIDDEN')
    }
    next()
  }
}

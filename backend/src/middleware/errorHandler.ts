import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../shared/AppError'

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      },
    })
  }

  console.error(error)
  return res.status(500).json({
    error: {
      message: 'Ha ocurrido un error inesperado',
      code: 'INTERNAL_SERVER_ERROR',
    },
  })
}

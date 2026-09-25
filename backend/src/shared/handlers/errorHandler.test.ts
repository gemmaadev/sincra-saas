import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { errorHandler } from '../../middleware/errorHandler'
import { AppError } from '../AppError'

function createMockResponse() {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('errorHandler', () => {
  // Given an AppError thrown somewhere in the app
  // When it reaches the error handler
  // Then it should respond with the error's own status code and message
  it('responds with the AppError status code and message', () => {
    const error = new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
    const res = createMockResponse()

    errorHandler(error, {} as Request, res, vi.fn() as NextFunction)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Cliente no encontrado', code: 'CLIENT_NOT_FOUND' },
    })
  })

  // Given an unexpected, uncontrolled error
  // When it reaches the error handler
  // Then it should respond with a generic 500 error, without exposing internal details
  it('responds with a generic 500 error for unexpected errors', () => {
    const error = new Error('Fallo interno de conexión a la base de datos')
    const res = createMockResponse()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    errorHandler(error, {} as Request, res, vi.fn() as NextFunction)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Ha ocurrido un error inesperado', code: 'INTERNAL_SERVER_ERROR' },
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith(error)

    consoleErrorSpy.mockRestore()
  })
})

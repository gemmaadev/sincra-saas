import rateLimit from 'express-rate-limit'

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Demasiados intentos. Inténtalo de nuevo más tarde.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
})

export const addressSearchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Demasiadas búsquedas. Espera un momento e inténtalo de nuevo.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
})

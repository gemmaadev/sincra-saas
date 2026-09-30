import { describe, it, expect } from 'vitest'
import express from 'express'
import rateLimit from 'express-rate-limit'
import request from 'supertest'

function createTestApp() {
  const app = express()
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 2,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many requests', code: 'TOO_MANY_REQUESTS' } },
  })

  app.post('/test-endpoint', limiter, (req, res) => {
    res.json({ success: true })
  })

  return app
}

describe('rate limit middleware', () => {
  // Given a limiter configured to allow 2 requests per window
  // When a client sends up to the limit
  // Then every request within the limit should succeed
  it('allows requests within the configured limit', async () => {
    const app = createTestApp()

    await request(app).post('/test-endpoint').expect(200)
    await request(app).post('/test-endpoint').expect(200)
  })

  // Given a limiter configured to allow 2 requests per window
  // When a client exceeds the limit
  // Then the next request should be rejected with 429
  it('rejects requests once the limit is exceeded', async () => {
    const app = createTestApp()

    await request(app).post('/test-endpoint').expect(200)
    await request(app).post('/test-endpoint').expect(200)

    const response = await request(app).post('/test-endpoint').expect(429)

    expect(response.body.error.code).toBe('TOO_MANY_REQUESTS')
  })
})

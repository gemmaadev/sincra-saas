import { describe, it, expect } from 'vitest'
import { signInvitationToken, verifyInvitationToken } from './jwt'

describe('signInvitationToken / verifyInvitationToken', () => {
  // Given a freshly signed invitation token
  // When verifying it right away
  // Then it should return the same payload that was signed
  it('round-trips a valid invitation token', () => {
    const token = signInvitationToken({ userId: 'user-1', businessId: 'biz-1', invite: true })

    const payload = verifyInvitationToken(token)

    expect(payload).toMatchObject({ userId: 'user-1', businessId: 'biz-1', invite: true })
  })

  // Given a token signed with an already-past expiration
  // When verifying it
  // Then it should throw, since jwt.verify rejects expired tokens on its own
  it('throws when the token has expired', async () => {
    const jwt = await import('jsonwebtoken')
    const expiredToken = jwt.sign(
      { userId: 'user-1', businessId: 'biz-1', invite: true },
      process.env.JWT_SECRET!,
      { expiresIn: '-1s' },
    )

    expect(() => verifyInvitationToken(expiredToken)).toThrow()
  })

  // Given a well-formed but unrelated token (e.g. a session token, not an invitation)
  // When verifying it as an invitation
  // Then it should throw, since the payload shape doesn't match
  it('throws when the token is not an invitation token', async () => {
    const jwt = await import('jsonwebtoken')
    const sessionToken = jwt.sign(
      { userId: 'user-1', businessId: 'biz-1', role: 'ADMIN' },
      process.env.JWT_SECRET!,
    )

    expect(() => verifyInvitationToken(sessionToken)).toThrow()
  })
})

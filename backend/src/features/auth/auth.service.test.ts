import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import jwt from 'jsonwebtoken'
import * as userModel from '../user/user.model'
import * as authModel from './auth.model'
import {
  exchangeMicrosoftCode,
  requestPasswordReset,
  findOrCreateSocialUser,
  resetPassword,
} from './auth.service'

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn().mockResolvedValue({ data: {}, error: null }),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

vi.mock('../user/user.model')
vi.mock('./auth.model')

function mockTokenResponse(idTokenPayload: Record<string, unknown>) {
  const idToken = jwt.sign(idTokenPayload, 'irrelevant-for-decode-only')
  return {
    ok: true,
    json: () => Promise.resolve({ id_token: idToken }),
  } as Response
}

describe('exchangeMicrosoftCode', () => {
  beforeEach(() => {
    vi.stubEnv('MICROSOFT_CLIENT_ID', 'test-client-id')
    vi.stubEnv('MICROSOFT_CLIENT_SECRET', 'test-client-secret')
    vi.stubEnv('MICROSOFT_REDIRECT_URI', 'http://localhost:3000/auth/microsoft/callback')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  // Given a valid authorization code
  // When exchanging it for a token
  // Then it should POST to Microsoft's token endpoint with the configured credentials and code
  it('exchanges the code with Microsoft using the configured client credentials', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockTokenResponse({ email: 'laura@outlook.com', name: 'Laura', sub: 'ms-123' }),
    )

    await exchangeMicrosoftCode('valid-auth-code')

    expect(fetch).toHaveBeenCalledWith(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      expect.objectContaining({ method: 'POST' }),
    )
    const requestBody = vi.mocked(fetch).mock.calls[0][1]?.body as URLSearchParams
    expect(requestBody.get('client_id')).toBe('test-client-id')
    expect(requestBody.get('client_secret')).toBe('test-client-secret')
    expect(requestBody.get('code')).toBe('valid-auth-code')
    expect(requestBody.get('redirect_uri')).toBe('http://localhost:3000/auth/microsoft/callback')
    expect(requestBody.get('grant_type')).toBe('authorization_code')
  })

  // Given a token response whose id_token carries an email claim
  // When exchanging the code
  // Then it should return the profile built from that id_token
  it('returns the profile decoded from the id_token', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockTokenResponse({ email: 'laura@outlook.com', name: 'Laura', sub: 'ms-123' }),
    )

    const profile = await exchangeMicrosoftCode('valid-auth-code')

    expect(profile).toEqual({ email: 'laura@outlook.com', name: 'Laura', microsoftId: 'ms-123' })
  })

  // Given an id_token with no name claim
  // When exchanging the code
  // Then the email should be used as a fallback name
  it('falls back to the email as the name when the id_token has no name claim', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockTokenResponse({ email: 'laura@outlook.com', sub: 'ms-123' }),
    )

    const profile = await exchangeMicrosoftCode('valid-auth-code')

    expect(profile.name).toBe('laura@outlook.com')
  })

  // Given an id_token with no email claim but a preferred_username
  // When exchanging the code
  // Then preferred_username should be used as the email
  it('falls back to preferred_username when the id_token has no email claim', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockTokenResponse({ preferred_username: 'laura@outlook.com', name: 'Laura', sub: 'ms-123' }),
    )

    const profile = await exchangeMicrosoftCode('valid-auth-code')

    expect(profile.email).toBe('laura@outlook.com')
  })

  // Given an id_token with neither email nor preferred_username
  // When exchanging the code
  // Then it should throw, since there is no way to identify the user
  it('throws when the id_token has no email and no preferred_username', async () => {
    vi.mocked(fetch).mockResolvedValue(mockTokenResponse({ name: 'Laura', sub: 'ms-123' }))

    await expect(exchangeMicrosoftCode('valid-auth-code')).rejects.toThrow()
  })

  // Given Microsoft's token endpoint responds with a non-ok status
  // When exchanging the code
  // Then it should throw instead of trying to read the response body
  it('throws when the token endpoint responds with a non-ok status', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    await expect(exchangeMicrosoftCode('expired-or-invalid-code')).rejects.toThrow()
  })
})

describe('requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a user who already requested a password reset before
  // When they request a new one
  // Then the previous unused tokens should be invalidated before creating the new one
  it('invalidates previous unused reset tokens before creating a new one', async () => {
    vi.mocked(userModel.findUserByEmail).mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hashed',
      name: 'Laura',
    } as never)

    await requestPasswordReset('laura@test.com')

    expect(authModel.invalidateUnusedResetTokens).toHaveBeenCalledWith('user-1')
    expect(authModel.insertResetToken).toHaveBeenCalledWith(
      expect.any(String),
      'user-1',
      expect.any(Date),
    )
  })

  // Given an email that doesn't belong to any user
  // When requesting a password reset
  // Then it should silently return without touching tokens or sending an email (prevents user enumeration)
  it('does nothing when the email does not belong to a user', async () => {
    vi.mocked(userModel.findUserByEmail).mockResolvedValue(null)

    await requestPasswordReset('no-existe@test.com')

    expect(authModel.invalidateUnusedResetTokens).not.toHaveBeenCalled()
    expect(authModel.insertResetToken).not.toHaveBeenCalled()
    expect(sendMock).not.toHaveBeenCalled()
  })
})

describe('findOrCreateSocialUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given no user with that email
  // When a social profile signs in
  // Then a new user is created from the profile
  it('creates a user when the email is not registered', async () => {
    vi.mocked(authModel.findUserWithBusinesses).mockResolvedValue(null)
    const profile = { email: 'laura@gmail.com', name: 'Laura', googleId: 'g-1' }

    await findOrCreateSocialUser(profile)

    expect(authModel.createSocialUser).toHaveBeenCalledWith(profile)
  })

  // Given an existing user without a googleId
  // When they sign in with Google
  // Then the googleId is linked to the existing user
  it('links the missing social id to an existing user', async () => {
    vi.mocked(authModel.findUserWithBusinesses).mockResolvedValue({
      id: 'user-1',
      googleId: null,
      microsoftId: null,
    } as never)

    await findOrCreateSocialUser({ email: 'laura@gmail.com', name: 'Laura', googleId: 'g-1' })

    expect(authModel.updateUserSocialIds).toHaveBeenCalledWith('user-1', { googleId: 'g-1' })
    expect(authModel.createSocialUser).not.toHaveBeenCalled()
  })

  // Given an existing user that already has the googleId
  // When they sign in with Google again
  // Then nothing is written
  it('does not write when the social id is already linked', async () => {
    const existing = { id: 'user-1', googleId: 'g-1', microsoftId: null }
    vi.mocked(authModel.findUserWithBusinesses).mockResolvedValue(existing as never)

    const result = await findOrCreateSocialUser({
      email: 'laura@gmail.com',
      name: 'Laura',
      googleId: 'g-1',
    })

    expect(result).toBe(existing)
    expect(authModel.updateUserSocialIds).not.toHaveBeenCalled()
  })
})

describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a token that does not exist, was used, or has expired
  // When resetting the password
  // Then it rejects and the password is not changed
  it.each([
    ['does not exist', null],
    [
      'was already used',
      { id: 't-1', userId: 'u-1', usedAt: new Date(), expiresAt: new Date(Date.now() + 60_000) },
    ],
    [
      'has expired',
      { id: 't-1', userId: 'u-1', usedAt: null, expiresAt: new Date(Date.now() - 60_000) },
    ],
  ])('rejects a token that %s', async (_label, resetToken) => {
    vi.mocked(authModel.findResetToken).mockResolvedValue(resetToken as never)

    await expect(resetPassword('token', 'nuevaPassword123')).rejects.toThrow()
    expect(authModel.applyPasswordReset).not.toHaveBeenCalled()
  })

  // Given a valid token
  // When resetting the password
  // Then the new hash and the token are applied together through the model
  it('applies the new password hash for a valid token', async () => {
    vi.mocked(authModel.findResetToken).mockResolvedValue({
      id: 't-1',
      userId: 'u-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    } as never)

    await resetPassword('token', 'nuevaPassword123')

    expect(authModel.applyPasswordReset).toHaveBeenCalledWith('u-1', 't-1', expect.any(String))
  })
})

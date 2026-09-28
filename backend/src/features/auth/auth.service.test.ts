import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { exchangeMicrosoftCode } from './auth.service'

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
    vi.mocked(fetch).mockResolvedValue(mockTokenResponse({ email: 'laura@outlook.com', sub: 'ms-123' }))

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

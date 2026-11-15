import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readGmailAccount } from './gmail-account'

const CLIENT_ID = 'test-client-id.apps.googleusercontent.com'
const ACCESS_TOKEN = 'google-access-token'

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response
}

function validTokenInfo(overrides: Record<string, unknown> = {}) {
  return {
    aud: CLIENT_ID,
    azp: CLIENT_ID,
    scope: 'openid email profile',
    ...overrides,
  }
}

function validUserInfo(overrides: Record<string, unknown> = {}) {
  return {
    sub: 'google-sub-1',
    email: 'Inbox@Gmail.com',
    email_verified: true,
    ...overrides,
  }
}

describe('readGmailAccount', () => {
  beforeEach(() => {
    vi.stubEnv('GOOGLE_CLIENT_ID', CLIENT_ID)
    vi.stubGlobal('fetch', vi.fn())
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // Given a token issued for this app with the profile scopes
  // When reading the Gmail account
  // Then tokeninfo is checked before userinfo, and the token stays out of the URL and the logs
  it('validates the token with tokeninfo before reading userinfo', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(validTokenInfo()))
      .mockResolvedValueOnce(jsonResponse(validUserInfo()))

    const account = await readGmailAccount(ACCESS_TOKEN)

    expect(account).toEqual({
      accountEmail: 'inbox@gmail.com',
      providerAccountId: 'google-sub-1',
    })

    const [tokenInfoUrl, tokenInfoInit] = vi.mocked(fetch).mock.calls[0]
    expect(tokenInfoUrl).toBe('https://oauth2.googleapis.com/tokeninfo')
    expect(String(tokenInfoUrl)).not.toContain(ACCESS_TOKEN)
    expect(tokenInfoInit).toMatchObject({ method: 'POST' })
    expect((tokenInfoInit?.body as URLSearchParams).get('access_token')).toBe(ACCESS_TOKEN)

    expect(vi.mocked(fetch).mock.calls[1][0]).toBe('https://www.googleapis.com/oauth2/v3/userinfo')
    expect(console.log).not.toHaveBeenCalled()
    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  // Given Google returns the long userinfo scope URLs
  // When validating the token
  // Then those URLs still count as email and profile
  it('accepts the long Google scope URLs', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(
          validTokenInfo({
            scope:
              'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          }),
        ),
      )
      .mockResolvedValueOnce(jsonResponse(validUserInfo()))

    await expect(readGmailAccount(ACCESS_TOKEN)).resolves.toMatchObject({
      accountEmail: 'inbox@gmail.com',
    })
  })

  // Given the token was issued for a different client
  // When aud or azp does not match GOOGLE_CLIENT_ID
  // Then it is rejected before userinfo, and the error does not include the token
  it.each(['aud', 'azp'] as const)(
    'rejects a token whose %s is not our client id',
    async (claim) => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse(validTokenInfo({ [claim]: 'other-client.apps.googleusercontent.com' })),
      )

      await expect(readGmailAccount(ACCESS_TOKEN)).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_TOKEN',
        message: expect.not.stringContaining(ACCESS_TOKEN),
      })

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(console.log).not.toHaveBeenCalled()
      expect(console.error).not.toHaveBeenCalled()
    },
  )

  // Given the token is missing a required scope
  // When validating it
  // Then it is rejected before userinfo
  it('rejects a token that is missing an expected scope', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(validTokenInfo({ scope: 'openid email' })))

    await expect(readGmailAccount(ACCESS_TOKEN)).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
    })

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  // Given Google rejects the token
  // When validating it
  // Then userinfo is not called
  it('rejects a token that tokeninfo does not accept', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, false))

    await expect(readGmailAccount(ACCESS_TOKEN)).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
    })

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  // Given no access token
  // When reading the account
  // Then it fails before calling Google
  it('rejects a missing token', async () => {
    await expect(readGmailAccount('  ')).rejects.toMatchObject({
      statusCode: 400,
      code: 'MISSING_TOKEN',
    })

    expect(fetch).not.toHaveBeenCalled()
  })
})

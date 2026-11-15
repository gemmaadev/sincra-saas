import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyGmailAccessToken } from './gmail-token'

const CLIENT_ID = 'google-client-id'
const ACCESS_TOKEN = 'secret-access-token'

function tokenInfo(overrides: Record<string, unknown> = {}, status = 200) {
  return new Response(
    JSON.stringify({
      aud: CLIENT_ID,
      azp: CLIENT_ID,
      sub: 'sub-1',
      email: 'tienda@gmail.com',
      scope: 'openid https://www.googleapis.com/auth/userinfo.email profile',
      ...overrides,
    }),
    { status },
  )
}

describe('verifyGmailAccessToken', () => {
  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = CLIENT_ID
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.GOOGLE_CLIENT_ID
  })

  it('returns the email and sub from a tokeninfo POST', async () => {
    vi.mocked(fetch).mockResolvedValue(tokenInfo())
    await expect(verifyGmailAccessToken(ACCESS_TOKEN)).resolves.toEqual({
      email: 'tienda@gmail.com',
      sub: 'sub-1',
    })

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toBe('https://oauth2.googleapis.com/tokeninfo')
    expect(String(url)).not.toContain(ACCESS_TOKEN)
    expect(init).toMatchObject({ method: 'POST' })
    expect(String(init && 'body' in init ? init.body : '')).toBe(`access_token=${ACCESS_TOKEN}`)

    vi.mocked(fetch).mockResolvedValue(tokenInfo({ scope: 'openid email profile' }))
    await expect(verifyGmailAccessToken(ACCESS_TOKEN)).resolves.toMatchObject({ sub: 'sub-1' })
  })

  it('rejects a bad token without logging it', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const cases: Array<[Record<string, unknown>, number]> = [
      [{ aud: 'other-client' }, 200],
      [{ azp: 'other-client' }, 200],
      [{ scope: 'openid profile' }, 200],
      [{ email: '' }, 200],
      [{ sub: '' }, 200],
      [{}, 400],
    ]

    for (const [overrides, status] of cases) {
      vi.mocked(fetch).mockResolvedValue(tokenInfo(overrides, status))
      const error = await verifyGmailAccessToken(ACCESS_TOKEN).catch((caught: Error) => caught)
      expect(error).toMatchObject({ statusCode: 401, code: 'GMAIL_TOKEN_INVALID' })
      expect(error.message).not.toContain(ACCESS_TOKEN)
    }

    vi.mocked(fetch).mockRejectedValue(new Error(`network ${ACCESS_TOKEN}`))
    const error = await verifyGmailAccessToken(ACCESS_TOKEN).catch((caught: Error) => caught)
    expect(error.message).not.toContain(ACCESS_TOKEN)
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})

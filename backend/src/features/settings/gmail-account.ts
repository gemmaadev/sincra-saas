import { AppError } from '../../shared/AppError'
import { normalizeAccountEmail, normalizeProviderAccountId } from './channel-account'

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

// Same scopes the client requests when connecting Gmail. Google may return the
// long userinfo URLs instead of the short names.
const EXPECTED_SCOPES = ['openid', 'email', 'profile']

const SCOPE_ALIASES: Record<string, string> = {
  openid: 'openid',
  email: 'email',
  profile: 'profile',
  'https://www.googleapis.com/auth/userinfo.email': 'email',
  'https://www.googleapis.com/auth/userinfo.profile': 'profile',
}

interface GoogleTokenInfo {
  aud?: string
  azp?: string
  scope?: string
}

interface GoogleUserInfo {
  sub?: string
  email?: string
  email_verified?: boolean
}

export async function readGmailAccount(accessToken?: string) {
  if (!accessToken?.trim()) {
    throw new AppError('Falta el token de Google', 400, 'MISSING_TOKEN')
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new AppError('Google no está configurado', 500, 'GOOGLE_NOT_CONFIGURED')
  }

  await assertGoogleAccessToken(accessToken, clientId)
  const profile = await readGoogleUserInfo(accessToken)

  const accountEmail = normalizeAccountEmail(profile.email)
  const providerAccountId = normalizeProviderAccountId(profile.sub)

  if (!profile.email_verified || !accountEmail || !providerAccountId) {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  return { accountEmail, providerAccountId }
}

async function assertGoogleAccessToken(accessToken: string, clientId: string) {
  const tokenInfo = await postGoogle<GoogleTokenInfo>(TOKENINFO_URL, {
    access_token: accessToken,
  })

  const grantedScopes = new Set(
    (tokenInfo.scope ?? '')
      .split(/\s+/)
      .map((scope) => SCOPE_ALIASES[scope])
      .filter((scope) => scope !== undefined),
  )
  const hasExpectedScopes = EXPECTED_SCOPES.every((scope) => grantedScopes.has(scope))

  if (tokenInfo.aud !== clientId || tokenInfo.azp !== clientId || !hasExpectedScopes) {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }
}

async function readGoogleUserInfo(accessToken: string) {
  let response: Response
  try {
    response = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  if (!response.ok) {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  return (await response.json()) as GoogleUserInfo
}

async function postGoogle<T>(url: string, body: Record<string, string>): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    })
  } catch {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  if (!response.ok) {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  return (await response.json()) as T
}

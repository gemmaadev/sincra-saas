import { AppError } from '../../shared/AppError'

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo'
const EMAIL_SCOPES = new Set(['email', 'https://www.googleapis.com/auth/userinfo.email'])

interface GoogleTokenInfo {
  aud?: string
  azp?: string
  sub?: string
  email?: string
  scope?: string
}

export async function verifyGmailAccessToken(accessToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new AppError('Google no está configurado', 500, 'GOOGLE_NOT_CONFIGURED')
  }

  let payload: GoogleTokenInfo
  let ok: boolean
  try {
    const response = await fetch(TOKENINFO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ access_token: accessToken }),
    })
    ok = response.ok
    payload = (await response.json()) as GoogleTokenInfo
  } catch {
    throw new AppError('No se pudo verificar la cuenta de Gmail', 401, 'GMAIL_TOKEN_INVALID')
  }

  const hasEmailScope = (payload.scope ?? '').split(' ').some((scope) => EMAIL_SCOPES.has(scope))
  if (
    !ok ||
    payload.aud !== clientId ||
    payload.azp !== clientId ||
    !hasEmailScope ||
    !payload.email ||
    !payload.sub
  ) {
    throw new AppError('No se pudo verificar la cuenta de Gmail', 401, 'GMAIL_TOKEN_INVALID')
  }

  return { email: payload.email, sub: payload.sub }
}

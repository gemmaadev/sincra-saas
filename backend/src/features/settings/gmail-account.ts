import { AppError } from '../../shared/AppError'
import { normalizeAccountEmail, normalizeProviderAccountId } from './channel-account'

interface GoogleUserInfo {
  sub?: string
  email?: string
  email_verified?: boolean
}

export async function readGmailAccount(accessToken?: string) {
  if (!accessToken?.trim()) {
    throw new AppError('Falta el token de Google', 400, 'MISSING_TOKEN')
  }

  let profile: GoogleUserInfo
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error('userinfo failed')
    }

    profile = (await response.json()) as GoogleUserInfo
  } catch {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  const accountEmail = normalizeAccountEmail(profile.email)
  const providerAccountId = normalizeProviderAccountId(profile.sub)

  if (!profile.email_verified || !accountEmail || !providerAccountId) {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  return { accountEmail, providerAccountId }
}

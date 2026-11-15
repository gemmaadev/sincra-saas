import { useRef } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { notifyError } from '@/shared/utils/notify'

// Same scopes as Google sign-in. The library also sends openid, email and profile.
export const GOOGLE_CONNECT_SCOPES = 'openid email profile'

export class GoogleAccessTokenError extends Error {
  readonly reason: 'cancelled' | 'failed'

  constructor(reason: 'cancelled' | 'failed') {
    super(reason)
    this.name = 'GoogleAccessTokenError'
    this.reason = reason
  }
}

export function notifyGoogleConnectError(error: unknown) {
  const cancelled = error instanceof GoogleAccessTokenError && error.reason === 'cancelled'
  notifyError(
    cancelled
      ? 'Has cancelado la conexión con Google.'
      : 'No se ha podido conectar con Google. Inténtalo de nuevo.',
  )
}

export function useGoogleAccessToken() {
  const pending = useRef<{
    resolve: (token: string) => void
    reject: (error: GoogleAccessTokenError) => void
  } | null>(null)

  const requestLogin = useGoogleLogin({
    flow: 'implicit',
    scope: GOOGLE_CONNECT_SCOPES,
    onSuccess: (tokenResponse) => {
      const current = pending.current
      pending.current = null
      if (!tokenResponse.access_token) {
        current?.reject(new GoogleAccessTokenError('failed'))
        return
      }
      current?.resolve(tokenResponse.access_token)
    },
    onError: () => {
      pending.current?.reject(new GoogleAccessTokenError('failed'))
      pending.current = null
    },
    onNonOAuthError: () => {
      pending.current?.reject(new GoogleAccessTokenError('cancelled'))
      pending.current = null
    },
  })

  return function requestGoogleAccessToken() {
    return new Promise<string>((resolve, reject) => {
      pending.current = { resolve, reject }
      requestLogin()
    })
  }
}

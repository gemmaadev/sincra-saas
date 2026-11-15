import type { ReactNode } from 'react'
import { vi } from 'vitest'

type GoogleLoginOptions = {
  flow?: string
  scope?: string
  onSuccess: (response: { access_token?: string }) => void
  onError: () => void
  onNonOAuthError: () => void
}

export const googleOauth = {
  trigger: vi.fn(),
  options: { current: null as GoogleLoginOptions | null },
}

export function succeedGoogleLogin() {
  googleOauth.trigger.mockReset()
  googleOauth.trigger.mockImplementation(() => {
    googleOauth.options.current?.onSuccess({ access_token: 'google-token' })
  })
}

export function googleOauthModule() {
  return {
    GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
    useGoogleLogin: (options: GoogleLoginOptions) => {
      googleOauth.options.current = options
      return googleOauth.trigger
    },
  }
}

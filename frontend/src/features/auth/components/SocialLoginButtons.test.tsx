import type { ReactNode } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SocialLoginButtons } from './SocialLoginButtons'
import { AuthContext } from '../context/AuthContext'
import type { AuthContextValue } from '../context/AuthContext'
import { api, ApiError } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'

vi.mock('@/shared/services', () => {
  class ApiError extends Error {
    status: number
    code: string
    constructor(message: string, status: number, code: string) {
      super(message)
      this.status = status
      this.code = code
    }
  }
  return {
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
    ApiError,
  }
})

const mockNavigate = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

interface GoogleTokenResponse {
  access_token: string
}

interface GoogleLoginCallbacks {
  onSuccess: (tokenResponse: GoogleTokenResponse) => void
  onError: () => void
  onNonOAuthError: () => void
}

const { mockGoogleLoginTrigger, googleLoginOptions } = vi.hoisted(() => ({
  mockGoogleLoginTrigger: vi.fn(),
  googleLoginOptions: {
    current: {
      onSuccess: () => {},
      onError: () => {},
      onNonOAuthError: () => {},
    } as GoogleLoginCallbacks,
  },
}))

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
  useGoogleLogin: (options: typeof googleLoginOptions.current) => {
    googleLoginOptions.current = options
    return mockGoogleLoginTrigger
  },
}))

const mockLogin = vi.fn().mockResolvedValue(undefined)

function renderSocialLoginButtons() {
  const authValue: AuthContextValue = {
    user: null,
    business: null,
    isAuthenticated: false,
    loading: false,
    login: mockLogin,
    logout: vi.fn().mockResolvedValue(undefined),
  }

  return render(
    withQueryClient(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <SocialLoginButtons />
        </MemoryRouter>
      </AuthContext.Provider>,
    ),
  )
}

describe('SocialLoginButtons', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
    mockNavigate.mockReset()
    mockGoogleLoginTrigger.mockReset()
    mockLogin.mockClear()
  })

  // Given the component renders
  // When the page loads
  // Then both a Google button and a Microsoft link should be shown
  it('renders a Google button and a Microsoft link', () => {
    renderSocialLoginButtons()

    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    const microsoftLink = screen.getByRole('link', { name: /microsoft/i })
    expect(microsoftLink).toHaveAttribute('href', 'http://localhost:3000/auth/microsoft/start')
  })

  // Given the Google button
  // When clicked
  // Then it should trigger Google's own login flow (not navigate or call the backend directly)
  it('triggers the Google login flow when the Google button is clicked', () => {
    renderSocialLoginButtons()

    fireEvent.click(screen.getByRole('button', { name: /google/i }))

    expect(mockGoogleLoginTrigger).toHaveBeenCalled()
  })

  // Given Google successfully returns an access token
  // When the backend confirms the user has no business yet
  // Then it should navigate to /onboarding without calling login()
  it('navigates to /onboarding when the Google user needs onboarding', async () => {
    vi.mocked(api.post).mockResolvedValue({
      needsOnboarding: true,
      needsBusinessSelection: false,
    })
    renderSocialLoginButtons()

    googleLoginOptions.current.onSuccess({ access_token: 'google-access-token' })

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/google', { accessToken: 'google-access-token' })
    })
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
    expect(mockLogin).not.toHaveBeenCalled()
  })

  // Given Google successfully returns an access token
  // When the backend confirms the user belongs to exactly one business
  // Then it should log in and navigate to /stats
  it('logs in and navigates to /stats when the Google user has one business', async () => {
    vi.mocked(api.post).mockResolvedValue({
      needsOnboarding: false,
      needsBusinessSelection: false,
    })
    renderSocialLoginButtons()

    googleLoginOptions.current.onSuccess({ access_token: 'google-access-token' })

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/stats')
  })

  // Given Google successfully returns an access token
  // When the backend confirms the user belongs to several businesses
  // Then it should navigate to /select-business
  it('navigates to /select-business when the Google user has several businesses', async () => {
    vi.mocked(api.post).mockResolvedValue({
      needsOnboarding: false,
      needsBusinessSelection: true,
    })
    renderSocialLoginButtons()

    googleLoginOptions.current.onSuccess({ access_token: 'google-access-token' })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/select-business')
    })
  })

  // Given the backend rejects the Google access token
  // When the login attempt is made
  // Then the backend's own error message should be shown
  it('shows the backend error message when the backend rejects the Google login', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN'),
    )
    renderSocialLoginButtons()

    googleLoginOptions.current.onSuccess({ access_token: 'google-access-token' })

    await waitFor(() => {
      expect(screen.getByText('No se pudo verificar el token de Google')).toBeInTheDocument()
    })
  })

  // Given Google itself fails before returning any token (e.g. consent denied)
  // When that error callback fires
  // Then a generic error message should be shown, without ever calling the backend
  it('shows a generic error message when Google itself fails', async () => {
    renderSocialLoginButtons()

    googleLoginOptions.current.onError()

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo iniciar sesión con Google. Inténtalo de nuevo.'),
      ).toBeInTheDocument()
    })
    expect(api.post).not.toHaveBeenCalled()
  })
})

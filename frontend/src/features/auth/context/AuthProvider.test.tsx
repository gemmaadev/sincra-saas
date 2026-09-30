import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider } from './AuthProvider'
import { useAuth } from '../hooks/useAuth'
import { api, ApiError } from '@/shared/services'

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

function AuthConsumer() {
  const { user, business, isAuthenticated, loading, login, logout } = useAuth()

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      <p>{isAuthenticated ? `Autenticado: ${user?.name} (${user?.role})` : 'No autenticado'}</p>
      <p>{business ? `Negocio: ${business.name}` : 'Sin negocio'}</p>
      <button onClick={() => login()}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

function renderWithAuthProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  )
}

describe('AuthProvider / useAuthState', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
  })

  // Given a valid session on the backend
  // When AuthProvider mounts
  // Then it should show a loading state first, then the user/business with a normalized role
  it('loads the session and normalizes the role from the backend', async () => {
    vi.mocked(api.get).mockResolvedValue({
      user: { id: '1', name: 'Laura', email: 'laura@tienda.com' },
      business: { id: 'biz-1', name: 'Tienda de Laura' },
      role: 'ADMIN',
    })

    renderWithAuthProvider()

    expect(screen.getByText('Cargando...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Autenticado: Laura (admin)')).toBeInTheDocument()
    })
    expect(screen.getByText('Negocio: Tienda de Laura')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/auth/me')
  })

  // Given the backend responds 401 (no active session)
  // When AuthProvider mounts
  // Then it should settle as not authenticated, without treating it as an unexpected error
  it('treats a 401 as simply not authenticated', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('No autenticado', 401, 'UNAUTHORIZED'))

    renderWithAuthProvider()

    await waitFor(() => {
      expect(screen.getByText('No autenticado')).toBeInTheDocument()
    })
    expect(screen.getByText('Sin negocio')).toBeInTheDocument()
  })

  // Given the session check fails for a reason other than 401 (network failure)
  // When AuthProvider mounts
  // Then it should still settle as not authenticated instead of leaving the app stuck loading
  it('settles as not authenticated when the session check fails unexpectedly', async () => {
    vi.mocked(api.get).mockRejectedValue(new TypeError('Failed to fetch'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithAuthProvider()

    await waitFor(() => {
      expect(screen.getByText('No autenticado')).toBeInTheDocument()
    })
  })

  // Given an authenticated session
  // When logout() is called
  // Then it should call POST /auth/logout and clear the user/business from state
  it('clears the session when logout is called', async () => {
    vi.mocked(api.get).mockResolvedValue({
      user: { id: '1', name: 'Laura', email: 'laura@tienda.com' },
      business: { id: 'biz-1', name: 'Tienda de Laura' },
      role: 'ADMIN',
    })
    vi.mocked(api.post).mockResolvedValue({ success: true })

    renderWithAuthProvider()

    await waitFor(() => {
      expect(screen.getByText('Autenticado: Laura (admin)')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    await waitFor(() => {
      expect(screen.getByText('No autenticado')).toBeInTheDocument()
    })
    expect(api.post).toHaveBeenCalledWith('/auth/logout')
  })

  // Given no session initially (e.g. right after a successful login request)
  // When login() is called
  // Then it should re-fetch the session and update the state from it
  it('re-fetches the session when login is called', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new ApiError('No autenticado', 401, 'UNAUTHORIZED'))

    renderWithAuthProvider()

    await waitFor(() => {
      expect(screen.getByText('No autenticado')).toBeInTheDocument()
    })

    vi.mocked(api.get).mockResolvedValueOnce({
      user: { id: '2', name: 'Marc', email: 'marc@tienda.com' },
      business: { id: 'biz-2', name: 'Tienda de Marc' },
      role: 'EMPLOYEE',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByText('Autenticado: Marc (employee)')).toBeInTheDocument()
    })
  })
})

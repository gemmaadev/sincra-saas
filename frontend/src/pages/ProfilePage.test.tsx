import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfilePage from './ProfilePage'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'
import { api } from '@/shared/services'

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

const mockProfile = {
  id: '1',
  name: 'Laura García',
  email: 'laura@tienda.com',
  role: 'ADMIN' as const,
  avatarUrl: null,
  phone: '+34 600 123 456',
  notificationPrefs: null,
  createdAt: '2025-04-12T10:24:00.000Z',
}

const authValue: AuthContextValue = {
  user: { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' },
  business: { id: 'biz-1', name: 'Tienda de Laura' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {},
}

function renderProfilePage(value: AuthContextValue = authValue) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({ user: mockProfile })
  })

  // Given an authenticated user
  // When the profile page is rendered
  // Then the header and the personal info tab should be shown by default
  it('renders the profile header and the personal info tab by default', async () => {
    renderProfilePage()

    expect(screen.getByRole('heading', { name: 'Laura García' })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Información personal', selected: true }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Datos personales')).toBeInTheDocument()
    })
  })

  // Given the profile page
  // When the user clicks the "Notificaciones" tab
  // Then the notifications content should replace the personal info content
  it('switches to the notifications tab', async () => {
    renderProfilePage()
    await waitFor(() => screen.getByText('Datos personales'))

    fireEvent.click(screen.getByRole('tab', { name: 'Notificaciones' }))

    expect(screen.getByText('Preferencias de notificación')).toBeInTheDocument()
    expect(screen.queryByText('Datos personales')).not.toBeInTheDocument()
  })

  // Given the profile page
  // When the user clicks the "Seguridad" tab
  // Then the security content should be shown
  it('switches to the security tab', async () => {
    renderProfilePage()
    await waitFor(() => screen.getByText('Datos personales'))

    fireEvent.click(screen.getByRole('tab', { name: 'Seguridad' }))

    expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument()
  })

  // Given no authenticated user
  // When the profile page is rendered
  // Then nothing should be rendered
  it('renders nothing when there is no authenticated user', () => {
    const { container } = renderProfilePage({ ...authValue, user: null })
    expect(container).toBeEmptyDOMElement()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppHeader } from './AppHeader'
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
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn() },
    ApiError,
  }
})

function renderHeader(logout: () => Promise<void> = async () => {}) {
  const authValue: AuthContextValue = {
    user: { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' },
    business: { id: 'biz-1', name: 'Tienda de Laura' },
    isAuthenticated: true,
    loading: false,
    login: async () => {},
    logout,
  }
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter>
            <AppHeader />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('HeaderApp', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({
      user: {
        id: '1',
        name: 'Laura García',
        email: 'laura@tienda.com',
        role: 'ADMIN',
        avatarUrl: null,
        phone: null,
        notificationPrefs: null,
        createdAt: '2025-04-12T10:24:00.000Z',
      },
    })
  })

  // Given the HeaderApp component
  // When it is rendered
  // Then the search input and the user's avatar should be visible
  it('renders the search input and the user avatar', () => {
    renderHeader()

    expect(
      screen.getByPlaceholderText('Buscar conversaciones, clientes, pedidos...'),
    ).toBeInTheDocument()
    expect(screen.getByText('LG')).toBeInTheDocument()
  })

  // Given the user menu is open
  // When the user clicks "Cerrar sesión"
  // Then a confirmation modal should open instead of logging out right away
  it('asks for confirmation before logging out', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    renderHeader(logout)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }))

    expect(await screen.findByRole('dialog', { name: '¿Cerrar sesión?' })).toBeInTheDocument()
    expect(logout).not.toHaveBeenCalled()
  })

  // Given the logout confirmation modal is open
  // When the user confirms
  // Then it should actually log out
  it('logs out once the user confirms', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    renderHeader(logout)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }))
    await screen.findByRole('dialog', { name: '¿Cerrar sesión?' })
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(logout).toHaveBeenCalledOnce()
  })

  // Given the logout confirmation modal is open
  // When the user cancels
  // Then it should close without logging out
  it('does not log out when the confirmation is cancelled', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    renderHeader(logout)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }))
    await screen.findByRole('dialog', { name: '¿Cerrar sesión?' })
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(logout).not.toHaveBeenCalled()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppHeader } from './AppHeader'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'
import type { UserBusiness } from '@/features/auth/types/business.types'
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
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn() },
    ApiError,
  }
})

const ONE_BUSINESS: UserBusiness[] = [
  { businessId: 'biz-1', name: 'Tienda de Laura', role: 'ADMIN' },
]

const TWO_BUSINESSES: UserBusiness[] = [
  { businessId: 'biz-1', name: 'Tienda de Laura', role: 'ADMIN' },
  { businessId: 'biz-2', name: 'Floristería Ana', role: 'EMPLOYEE' },
]

function renderHeader({
  logout = async () => {},
  login = async () => {},
  businesses = ONE_BUSINESS,
  initialPath = '/',
}: {
  logout?: () => Promise<void>
  login?: () => Promise<void>
  businesses?: UserBusiness[]
  initialPath?: string
} = {}) {
  vi.mocked(api.get).mockImplementation(async (path: string) => {
    if (path === '/auth/me/businesses') return { businesses }
    return {
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
    }
  })

  const authValue: AuthContextValue = {
    user: { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' },
    business: { id: 'biz-1', name: 'Tienda de Laura' },
    isAuthenticated: true,
    loading: false,
    login,
    logout,
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(['clients'], [{ id: 'from-old-business' }])

  const view = render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={[initialPath]}>
            <AppHeader />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MantineProvider>,
  )

  return { ...view, queryClient }
}

describe('HeaderApp', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
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
    renderHeader({ logout })
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
    renderHeader({ logout })
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
    renderHeader({ logout })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }))
    await screen.findByRole('dialog', { name: '¿Cerrar sesión?' })
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(logout).not.toHaveBeenCalled()
  })

  // Given the AppHeader component
  // When the user clicks the mobile menu button
  // Then the Sidebar Drawer should open, showing the nav content
  it('opens the mobile Sidebar Drawer when the menu button is clicked', async () => {
    renderHeader()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))

    expect(await screen.findByRole('link', { name: /Clientes/ })).toBeInTheDocument()
  })

  // Given the mobile Sidebar Drawer is open
  // When the user closes it
  // Then its content should no longer be visible
  it('closes the mobile Sidebar Drawer when dismissed', async () => {
    renderHeader()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await screen.findByRole('link', { name: /Clientes/ })

    await user.click(screen.getByRole('button', { name: 'Cerrar menú' }))

    await waitFor(() =>
      expect(screen.queryByRole('link', { name: /Clientes/ })).not.toBeInTheDocument(),
    )
  })

  // Given the user belongs to a single business
  // When the user menu is opened
  // Then "Cambiar de negocio" should stay hidden
  it('hides the business switcher when the user has one business', async () => {
    const { queryClient } = renderHeader()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))
    await waitFor(() =>
      expect(queryClient.getQueryState(['session-businesses'])?.status).toBe('success'),
    )

    expect(screen.queryByText('Cambiar de negocio')).not.toBeInTheDocument()
  })

  // Given the user belongs to more than one business
  // When the user menu is opened
  // Then each business is listed and the current one is marked
  it('lists every business and marks the current one', async () => {
    renderHeader({ businesses: TWO_BUSINESSES })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))

    expect(await screen.findByText('Cambiar de negocio')).toBeInTheDocument()
    expect(screen.getByRole('menuitemradio', { name: 'Tienda de Laura (actual)' })).toBeDisabled()
    expect(screen.getByRole('menuitemradio', { name: 'Floristería Ana' })).toBeEnabled()
    expect(screen.getByText('Actual')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByText('Empleado')).toBeInTheDocument()
  })

  // Given another business is listed
  // When the user chooses it
  // Then the active business changes and cached data from the previous one is dropped
  it('switches business and clears cached data from the previous one', async () => {
    vi.mocked(api.post).mockResolvedValue({ success: true })
    const login = vi.fn().mockResolvedValue(undefined)
    const { queryClient } = renderHeader({
      businesses: TWO_BUSINESSES,
      login,
      initialPath: '/clients/client-1',
    })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'Floristería Ana' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/switch-business', { businessId: 'biz-2' })
      expect(login).toHaveBeenCalledOnce()
    })
    expect(queryClient.getQueryData(['clients'])).toBeUndefined()
  })

  // Given the backend rejects the chosen business
  // When the user tries to switch
  // Then the menu explains why and the previous data stays
  it('shows the error and keeps the previous data when the switch is rejected', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('No perteneces a ese negocio', 403, 'FORBIDDEN'),
    )
    const login = vi.fn().mockResolvedValue(undefined)
    const { queryClient } = renderHeader({ businesses: TWO_BUSINESSES, login })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'Floristería Ana' }))

    expect(await screen.findByText('No perteneces a ese negocio')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(['clients'])).toEqual([{ id: 'from-old-business' }])
  })
})

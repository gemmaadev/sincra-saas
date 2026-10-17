import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'
import { DangerZoneCard } from './DangerZoneCard'

const mockNavigate = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { delete: vi.fn() } }
})

function renderCard(logout: () => Promise<void> = vi.fn().mockResolvedValue(undefined)) {
  const authValue: AuthContextValue = {
    user: { id: 'user-1', name: 'Laura García', email: 'laura@sincra.app', role: 'admin' },
    business: { id: 'biz-1', name: 'Tienda de Laura' },
    isAuthenticated: true,
    loading: false,
    login: async () => {},
    logout,
  }

  render(
    withQueryClient(
      <MantineProvider>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter>
            <DangerZoneCard />
          </MemoryRouter>
        </AuthContext.Provider>
      </MantineProvider>,
    ),
  )
  return { user: userEvent.setup(), logout }
}

describe('DangerZoneCard', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset()
    mockNavigate.mockClear()
  })

  // Given the admin clicks "Eliminar negocio"
  // When the confirmation modal opens
  // Then it should show the confirmation copy
  it('opens the confirmation modal', async () => {
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Eliminar negocio' }))

    expect(await screen.findByRole('dialog', { name: '¿Eliminar negocio?' })).toBeInTheDocument()
  })

  // Given the admin confirms the deletion
  // When it succeeds
  // Then it should call DELETE /settings/account, log out and navigate to /login
  it('deletes the business, logs out and redirects to /login on confirm', async () => {
    vi.mocked(api.delete).mockResolvedValue({ success: true })
    const { user, logout } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Eliminar negocio' }))
    const dialog = within(await screen.findByRole('dialog', { name: '¿Eliminar negocio?' }))
    await user.click(dialog.getByRole('button', { name: 'Eliminar negocio' }))

    expect(api.delete).toHaveBeenCalledWith('/settings/account')
    await waitFor(() => expect(logout).toHaveBeenCalled())
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  // Given the backend rejects the deletion
  // When the admin confirms
  // Then the error should be shown and the user should not be logged out
  it('shows the backend error and does not log out when deletion fails', async () => {
    vi.mocked(api.delete).mockRejectedValue(
      new ApiError('No puedes eliminar este negocio', 403, 'FORBIDDEN'),
    )
    const { user, logout } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Eliminar negocio' }))
    const dialog = within(await screen.findByRole('dialog', { name: '¿Eliminar negocio?' }))
    await user.click(dialog.getByRole('button', { name: 'Eliminar negocio' }))

    expect(await screen.findByText('No puedes eliminar este negocio')).toBeInTheDocument()
    expect(logout).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // Given the modal is open
  // When the admin clicks "Cancelar"
  // Then it should close without calling the API
  it('closes without deleting on cancel', async () => {
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Eliminar negocio' }))
    const dialog = within(await screen.findByRole('dialog', { name: '¿Eliminar negocio?' }))
    await user.click(dialog.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(api.delete).not.toHaveBeenCalled()
  })
})

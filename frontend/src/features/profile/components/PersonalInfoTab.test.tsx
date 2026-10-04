import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PersonalInfoTab } from './PersonalInfoTab'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue, User } from '@/features/auth/context/AuthContext'
import { api } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'

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

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

const user: User = { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' }

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

function renderPersonalInfoTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const login = vi.fn().mockResolvedValue(undefined)
  const authValue: AuthContextValue = {
    user,
    business: null,
    isAuthenticated: true,
    loading: false,
    login,
    logout: async () => {},
  }

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <PersonalInfoTab user={user} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )

  return { login }
}

describe('PersonalInfoTab', () => {
  beforeEach(() => {
    vi.mocked(notifySuccess).mockReset()
    vi.mocked(api.get).mockReset()
    vi.mocked(api.patch).mockReset()
    vi.mocked(api.get).mockResolvedValue({ user: mockProfile })
    vi.mocked(api.patch).mockImplementation(async (_path, body) => ({
      user: { ...mockProfile, ...(body as object) },
    }))
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  // Given the profile data is still loading
  // When the tab is first rendered
  // Then a loading message should be shown instead of the form
  it('shows a loading message while the profile is being fetched', () => {
    renderPersonalInfoTab()
    expect(screen.getByText('Cargando datos personales…')).toBeInTheDocument()
  })

  // Given the profile has loaded
  // When the tab is rendered
  // Then it should show the read-only view with the user's data
  it('renders the read-only view with the user data once loaded', async () => {
    renderPersonalInfoTab()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument()
    })
    expect(screen.getByText('Laura García')).toBeInTheDocument()
    expect(screen.getByText('laura@tienda.com')).toBeInTheDocument()
    expect(screen.getByText('+34 600 123 456')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
  })

  // Given the profile request fails
  // When the tab is rendered
  // Then an error message should be shown instead of the data
  it('shows an error message when the profile fails to load', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network error'))
    renderPersonalInfoTab()

    await waitFor(() => {
      expect(
        screen.getByText('No se pudieron cargar tus datos. Inténtalo de nuevo más tarde.'),
      ).toBeInTheDocument()
    })
  })

  // Given the read-only view
  // When the user clicks "Editar perfil"
  // Then the editable form should appear, prefilled with the current name and phone
  it('switches to the editable form when clicking "Editar perfil"', async () => {
    renderPersonalInfoTab()
    await waitFor(() => screen.getByRole('button', { name: 'Editar perfil' }))

    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))

    expect(screen.getByLabelText('Nombre')).toHaveValue('Laura García')
    expect(screen.getByLabelText('Teléfono')).toHaveValue('+34 600 123 456')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  // Given the editable form
  // When the name is cleared and the form is submitted
  // Then a validation error should be shown and nothing should be sent to the backend
  it('shows a validation error when the name is cleared', async () => {
    renderPersonalInfoTab()
    await waitFor(() => screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    })
    expect(api.patch).not.toHaveBeenCalled()
  })

  // Given the editable form with unsaved changes
  // When the user clicks "Cancelar"
  // Then it should discard the changes and return to the read-only view
  it('discards changes and returns to the read-only view when clicking "Cancelar"', async () => {
    renderPersonalInfoTab()
    await waitFor(() => screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Otro nombre' } })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument()
    expect(screen.getByText('Laura García')).toBeInTheDocument()
  })

  // Given valid changes in the editable form
  // When the form is submitted
  // Then it should PATCH /user/profile, refresh the session and show a success notification
  it('saves the changes, refreshes the session and notifies it', async () => {
    const { login } = renderPersonalInfoTab()
    await waitFor(() => screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Laura Nueva' } })

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith('Cambios guardados')
    })
    expect(api.patch).toHaveBeenCalledWith('/user/profile', {
      name: 'Laura Nueva',
      phone: '+34 600 123 456',
    })
    expect(login).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument()
  })

  // Given the update request fails
  // When the form is submitted
  // Then an error message should be shown and the form should stay open
  it('shows an error message when saving fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('network error'))
    renderPersonalInfoTab()
    await waitFor(() => screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(
        screen.getByText('No se pudieron guardar los cambios. Inténtalo de nuevo.'),
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })
})

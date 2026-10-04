import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ResetPasswordPage from './ResetPasswordPage'
import { api, ApiError } from '@/shared/services'
import { withQueryClient } from '@/test/withQueryClient'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return {
    ...actual,
    api: { ...actual.api, post: vi.fn() },
  }
})

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderWithToken(token: string | null) {
  const initialEntry = token ? `/reset-password?token=${token}` : '/reset-password'
  return render(
    withQueryClient(
      <MemoryRouter initialEntries={[initialEntry]}>
        <ResetPasswordPage />
      </MemoryRouter>,
    ),
  )
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given no token in the URL
  // When the page renders
  // Then it should show an invalid link message instead of the form
  it('shows an invalid link message when there is no token', () => {
    renderWithToken(null)

    expect(screen.getByRole('heading', { level: 1, name: 'Enlace no válido' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument()
  })

  // Given a valid token in the URL
  // When submitted empty
  // Then required field errors should be shown
  it('shows validation errors when submitted empty', async () => {
    renderWithToken('valid-token')

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }))

    await waitFor(() => {
      expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
      expect(screen.getByText('Repite tu contraseña')).toBeInTheDocument()
    })
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given a password shorter than 8 characters
  // When submitted
  // Then a minimum length error should be shown
  it('shows an error when the password is too short', async () => {
    renderWithToken('valid-token')

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }))

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument()
    })
  })

  // Given a confirmation password that doesn't match
  // When submitted
  // Then a mismatch error should be shown
  it('shows an error when the passwords do not match', async () => {
    renderWithToken('valid-token')

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'otraDistinta123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }))

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })
  })

  // Given matching, valid passwords and a valid token
  // When submitted
  // Then it should call POST /auth/reset-password with the token and navigate to /login
  it('calls the API and navigates to /login on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ success: true })

    renderWithToken('valid-token')

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'valid-token',
        newPassword: 'contraseña123',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  // Given a token the backend rejects (expired, used, or invalid)
  // When submitted
  // Then it should show an error message and not navigate away
  it('shows an error message when the API rejects the token', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Token inválido', 400, 'INVALID_TOKEN'))

    renderWithToken('expired-token')

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }))

    await waitFor(() => {
      expect(
        screen.getByText('Este enlace no es válido o ha caducado. Solicita uno nuevo.'),
      ).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

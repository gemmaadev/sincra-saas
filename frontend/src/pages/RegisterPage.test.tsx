import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RegisterPage from './RegisterPage'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { api, ApiError } from '@/shared/services'
import { withQueryClient } from '@/test/withQueryClient'

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

function renderRegisterPage() {
  return render(
    withQueryClient(
      <GoogleOAuthProvider clientId="test-google-client-id">
        <MemoryRouter>
          <AuthProvider>
            <RegisterPage />
          </AuthProvider>
        </MemoryRouter>
      </GoogleOAuthProvider>,
    ),
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockRejectedValue(new ApiError('No autenticado', 401, 'UNAUTHORIZED'))
  })

  // Given the registration form
  // When submitted empty
  // Then required field errors should be shown
  it('shows validation errors when submitted empty', async () => {
    renderRegisterPage()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(screen.getByText('Tu nombre es obligatorio')).toBeInTheDocument()
      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
      expect(screen.getByText('Repite tu contraseña')).toBeInTheDocument()
      expect(screen.getByText('Debes aceptar los términos para continuar')).toBeInTheDocument()
    })
  })

  // Given a password shorter than 8 characters
  // When submitted
  // Then a minimum length error should be shown
  it('shows an error when the password is too short', async () => {
    renderRegisterPage()

    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument()
    })
  })

  // Given a confirmation password that doesn't match
  // When submitted
  // Then a mismatch error should be shown
  it('shows an error when the passwords do not match', async () => {
    renderRegisterPage()

    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'contraseña123' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'otraDistinta123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })
  })

  // Given all valid data and terms accepted
  // When submitted
  // Then no validation errors should be shown
  it('shows no errors when submitted with valid data', async () => {
    renderRegisterPage()

    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: 'Laura' },
    })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'laura@tienda.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'contraseña123' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.click(screen.getByLabelText(/Acepto los/))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(screen.queryByText('Tu nombre es obligatorio')).not.toBeInTheDocument()
      expect(screen.queryByText('El email es obligatorio')).not.toBeInTheDocument()
      expect(screen.queryByText('Las contraseñas no coinciden')).not.toBeInTheDocument()
    })
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from './LoginPage'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
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

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
    vi.mocked(api.get).mockRejectedValue(new ApiError('No autenticado', 401, 'UNAUTHORIZED'))
  })

  // Given the login form
  // When submitted empty
  // Then required field errors should be shown
  it('shows validation errors when submitted empty', async () => {
    renderLoginPage()

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
    })
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given the login form
  // When an invalid email format is entered
  // Then an email format error should be shown
  it('shows an error for an invalid email format', async () => {
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'no-es-un-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Introduce un email válido')).toBeInTheDocument()
    })
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given valid form data and correct credentials
  // When submitted
  // Then it should POST to /auth/login with those credentials
  it('submits the credentials to the backend with valid data', async () => {
    vi.mocked(api.post).mockResolvedValue({ needsBusinessSelection: false })
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'laura@tienda.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'laura@tienda.com',
        password: 'contraseña123',
      })
    })
    expect(screen.queryByText('El email es obligatorio')).not.toBeInTheDocument()
    expect(screen.queryByText('La contraseña es obligatoria')).not.toBeInTheDocument()
  })

  // Given wrong credentials
  // When submitted
  // Then the backend's own error message should be shown to the user
  it('shows the backend error message with wrong credentials', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('Email o contraseña incorrectos', 401, 'INVALID_CREDENTIALS'),
    )
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'laura@tienda.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'incorrecta' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Email o contraseña incorrectos')).toBeInTheDocument()
    })
  })
})

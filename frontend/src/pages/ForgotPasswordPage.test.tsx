import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ForgotPasswordPage from './ForgotPasswordPage'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'

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

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given the forgot password form
  // When submitted empty
  // Then a required field error should be shown
  it('shows a validation error when submitted empty', async () => {
    render(
      withQueryClient(
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>,
      ),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => {
      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
    })
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given an invalid email format
  // When submitted
  // Then an invalid email error should be shown
  it('shows an error when the email format is invalid', async () => {
    render(
      withQueryClient(
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>,
      ),
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'no-es-un-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => {
      expect(screen.getByText('Introduce un email válido')).toBeInTheDocument()
    })
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given a valid email
  // When submitted
  // Then it should call POST /auth/forgot-password and navigate to /verify-email with the email
  it('calls the API and navigates to /verify-email on submit', async () => {
    vi.mocked(api.post).mockResolvedValue({ success: true })

    render(
      withQueryClient(
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>,
      ),
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'laura@tienda.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'laura@tienda.com',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/verify-email', {
        state: { email: 'laura@tienda.com' },
      })
    })
  })
})

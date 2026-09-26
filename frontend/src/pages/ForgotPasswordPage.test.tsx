import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { ForgotPasswordPage } from './ForgotPasswordPage'

describe('ForgotPasswordPage', () => {
  // Given the forgot password form
  // When submitted empty
  // Then a required field error should be shown
  it('shows a validation error when submitted empty', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => {
      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
    })
  })

  // Given an invalid email format
  // When submitted
  // Then an invalid email error should be shown
  it('shows an error when the email format is invalid', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'no-es-un-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => {
      expect(screen.getByText('Introduce un email válido')).toBeInTheDocument()
    })
  })

  // Given a valid email
  // When submitted
  // Then no validation errors should be shown
  it('shows no errors when submitted with a valid email', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'laura@tienda.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => {
      expect(screen.queryByText('El email es obligatorio')).not.toBeInTheDocument()
      expect(screen.queryByText('Introduce un email válido')).not.toBeInTheDocument()
    })
  })
})

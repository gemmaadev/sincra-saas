import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { ResetPasswordPage } from './ResetPasswordPage'

describe('ResetPasswordPage', () => {
  // Given the reset password form
  // When submitted empty
  // Then required field errors should be shown
  it('shows validation errors when submitted empty', async () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }))

    await waitFor(() => {
      expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
      expect(screen.getByText('Repite tu contraseña')).toBeInTheDocument()
    })
  })

  // Given a password shorter than 8 characters
  // When submitted
  // Then a minimum length error should be shown
  it('shows an error when the password is too short', async () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

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
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

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

  // Given matching, valid passwords
  // When submitted
  // Then no validation errors should be shown
  it('shows no errors when submitted with valid matching passwords', async () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }))

    await waitFor(() => {
      expect(screen.queryByText('La contraseña es obligatoria')).not.toBeInTheDocument()
      expect(screen.queryByText('Las contraseñas no coinciden')).not.toBeInTheDocument()
    })
  })
})

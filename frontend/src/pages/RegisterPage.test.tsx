import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import RegisterPage from './RegisterPage'

describe('RegisterPage', () => {
  // Given the registration form
  // When submitted empty
  // Then required field errors should be shown
  it('shows validation errors when submitted empty', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

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
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

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
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

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
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

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

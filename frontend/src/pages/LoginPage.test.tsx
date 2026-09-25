import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  // Given the login form
  // When submitted empty
  // Then required field errors should be shown
  it('shows validation errors when submitted empty', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
    })
  })

  // Given the login form
  // When an invalid email format is entered
  // Then an email format error should be shown
  it('shows an error for an invalid email format', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'no-es-un-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Introduce un email válido')).toBeInTheDocument()
    })
  })

  // Given valid form data
  // When submitted
  // Then no validation errors should be shown
  it('shows no errors when submitted with valid data', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'laura@tienda.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'contraseña123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.queryByText('El email es obligatorio')).not.toBeInTheDocument()
      expect(screen.queryByText('La contraseña es obligatoria')).not.toBeInTheDocument()
    })
  })
})

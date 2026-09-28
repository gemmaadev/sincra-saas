import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PersonalInfoTab } from './PersonalInfoTab'
import type { User } from '@/features/auth/context/AuthContext'

const user: User = { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' }

describe('PersonalInfoTab', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  // Given the personal info tab
  // When it is rendered
  // Then it should start in read-only view mode showing the user's data
  it('renders the read-only view with the user data by default', () => {
    render(<PersonalInfoTab user={user} />)
    expect(screen.getByText('Laura García')).toBeInTheDocument()
    expect(screen.getByText('laura@tienda.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
  })

  // Given the read-only view
  // When the user clicks "Editar perfil"
  // Then the editable form should appear, prefilled with the current name
  it('switches to the editable form when clicking "Editar perfil"', () => {
    render(<PersonalInfoTab user={user} />)
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))

    expect(screen.getByLabelText('Nombre')).toHaveValue('Laura García')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  // Given the editable form
  // When the name is cleared and the form is submitted
  // Then a validation error should be shown
  it('shows a validation error when the name is cleared', async () => {
    render(<PersonalInfoTab user={user} />)
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    })
  })

  // Given the editable form with unsaved changes
  // When the user clicks "Cancelar"
  // Then it should discard the changes and return to the read-only view
  it('discards changes and returns to the read-only view when clicking "Cancelar"', () => {
    render(<PersonalInfoTab user={user} />)
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Otro nombre' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument()
    expect(screen.getByText('Laura García')).toBeInTheDocument()
  })

  // Given valid changes in the editable form
  // When the form is submitted
  // Then it should save, return to the read-only view and show a confirmation
  it('saves the changes and shows a confirmation', async () => {
    render(<PersonalInfoTab user={user} />)
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(screen.getByText('Cambios guardados')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument()
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProfileHeader } from './ProfileHeader'
import type { User } from '@/features/auth/context/AuthContext'

const user: User = { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' }

describe('ProfileHeader', () => {
  // Given a user
  // When the header is rendered
  // Then the name, role badge and email should be visible
  it('renders the user name, role and email', () => {
    render(<ProfileHeader user={user} />)
    expect(screen.getByRole('heading', { name: 'Laura García' })).toBeInTheDocument()
    expect(screen.getByText('Propietario/a')).toBeInTheDocument()
    expect(screen.getByText('laura@tienda.com')).toBeInTheDocument()
  })

  // Given an employee user
  // When the header is rendered
  // Then the employee role label should be used instead of the owner one
  it('shows the employee role label for employee users', () => {
    render(<ProfileHeader user={{ ...user, role: 'employee' }} />)
    expect(screen.getByText('Empleado/a')).toBeInTheDocument()
  })

  // Given the profile header
  // When the user picks a new photo from the file input
  // Then the avatar image should update to the new preview
  it('updates the avatar preview when a new photo is selected', () => {
    const objectUrl = 'blob:mock-avatar'
    URL.createObjectURL = vi.fn().mockReturnValue(objectUrl)
    render(<ProfileHeader user={user} />)

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Cambiar foto de perfil'), {
      target: { files: [file] },
    })

    expect(screen.getByAltText('Laura García')).toHaveAttribute('src', objectUrl)
  })
})

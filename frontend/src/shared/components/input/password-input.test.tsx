import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { PasswordInput } from './PasswordInput'

const mockRegistration: UseFormRegisterReturn = {
  name: 'password',
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}

describe('PasswordInput', () => {
  // Given a PasswordInput
  // When it is rendered
  // Then the field should hide the password by default
  it('hides the password by default', () => {
    render(<PasswordInput label="Contraseña" registration={mockRegistration} />)
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
  })

  // Given a PasswordInput with the password hidden
  // When the user clicks the eye button
  // Then the field should show the password as plain text, and the button label should flip
  it('toggles the password visibility', async () => {
    const user = userEvent.setup()
    render(<PasswordInput label="Contraseña" registration={mockRegistration} />)

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument()
  })
})

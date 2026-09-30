import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  // Given an Input with a label
  // When it is rendered
  // Then the label should be correctly associated with the input field
  it('associates the label with the input', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  // Given an Input with an error message
  // When it is rendered
  // Then the error should be visible and the input marked as invalid
  it('shows the error message and marks the input as invalid', () => {
    render(<Input label="Email" error="Email inválido" />)
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  // Given an Input without an error
  // When it is rendered
  // Then it should not be marked as invalid
  it('is not marked as invalid when there is no error', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false')
  })

  // Given an Input rendered on screen
  // When the user types into it
  // Then the typed value should appear in the field
  it('updates its value as the user types', async () => {
    const user = userEvent.setup()
    render(<Input label="Nombre" />)
    const input = screen.getByLabelText('Nombre')
    await user.type(input, 'Laura')
    expect(input).toHaveValue('Laura')
  })
})

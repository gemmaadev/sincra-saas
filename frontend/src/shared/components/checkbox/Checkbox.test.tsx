import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  // Given a Checkbox with a label
  // When it is rendered
  // Then it should be reachable by its label
  it('is labelled by its text', () => {
    render(<Checkbox label="Recordarme" />)
    expect(screen.getByRole('checkbox', { name: 'Recordarme' })).toBeInTheDocument()
  })

  // Given a Checkbox whose label contains a link
  // When it is rendered
  // Then the link should be rendered inside the label
  it('accepts rich content as the label', () => {
    render(<Checkbox label={<a href="/terminos">Términos</a>} />)
    expect(screen.getByRole('link', { name: 'Términos' })).toBeInTheDocument()
  })

  // Given a Checkbox
  // When the user clicks it
  // Then onChange should fire
  it('calls onChange when clicked', () => {
    const handleChange = vi.fn()
    render(<Checkbox label="Gmail" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Gmail' }))

    expect(handleChange).toHaveBeenCalledOnce()
  })

  // Given a Checkbox with an error
  // When it is rendered
  // Then the error should be shown and linked to the checkbox
  it('shows the error and marks the checkbox as invalid', () => {
    render(<Checkbox label="Acepto" error="Debes aceptar" />)

    const checkbox = screen.getByRole('checkbox', { name: 'Acepto' })

    expect(screen.getByText('Debes aceptar')).toBeInTheDocument()
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    expect(checkbox).toHaveAccessibleDescription('Debes aceptar')
  })
})

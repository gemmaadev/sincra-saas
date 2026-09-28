import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NotificationsTab } from './NotificationsTab'

describe('NotificationsTab', () => {
  // Given the notifications tab
  // When it is rendered
  // Then the default preferences should be visible with their initial state
  it('renders the notification preferences with their initial state', () => {
    render(<NotificationsTab />)
    expect(screen.getByRole('switch', { name: 'Nuevos mensajes' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('switch', { name: 'Resumen diario' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  // Given a preference toggle
  // When the user clicks it
  // Then it should flip its checked state
  it('toggles a preference when clicked', () => {
    render(<NotificationsTab />)
    const toggle = screen.getByRole('switch', { name: 'Resumen diario' })

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  // Given a different preferred channel and toggle changes
  // When the user clicks "Guardar cambios"
  // Then a confirmation message should be shown
  it('saves the preferences and shows a confirmation', () => {
    render(<NotificationsTab />)
    fireEvent.change(screen.getByLabelText('Canal preferido'), { target: { value: 'email' } })

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getByText('Cambios guardados')).toBeInTheDocument()
  })

  // Given the confirmation is already shown
  // When the user toggles another preference
  // Then the confirmation should be hidden again, since it no longer reflects saved state
  it('hides the confirmation again after a further change', () => {
    render(<NotificationsTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('Cambios guardados')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: 'Nuevos mensajes' }))

    expect(screen.queryByText('Cambios guardados')).not.toBeInTheDocument()
  })
})

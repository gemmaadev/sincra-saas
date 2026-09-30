import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SincraButton } from './SincraButton'

describe('Button', () => {
  // Given a Button with children text
  // When it is rendered
  // Then the text should be visible on screen
  it('renders its children', () => {
    render(<SincraButton>Guardar</SincraButton>)
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  // Given a Button in loading state
  // When it is rendered
  // Then it should be disabled and marked as busy for screen readers
  it('disables itself and sets aria-busy when loading', () => {
    render(<SincraButton loading>Guardar</SincraButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  // Given a Button with an onClick handler
  // When the user clicks it
  // Then the handler should be called once
  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<SincraButton onClick={onClick}>Guardar</SincraButton>)
    screen.getByRole('button').click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  // Given a Button that is disabled
  // When the user clicks it
  // Then the onClick handler should NOT be called
  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      <SincraButton disabled onClick={onClick}>
        Guardar
      </SincraButton>,
    )
    screen.getByRole('button').click()
    expect(onClick).not.toHaveBeenCalled()
  })
})

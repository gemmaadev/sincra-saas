import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ErrorFallback } from './ErrorFallback'

describe('ErrorFallback', () => {
  // Given the ErrorFallback component
  // When it is rendered
  // Then the error message and reload button should be visible
  it('renders the error message and reload button', () => {
    render(<ErrorFallback />)
    expect(screen.getByText('¡Oh nooo! Algo ha salido mal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recargar página' })).toBeInTheDocument()
  })

  // Given the ErrorFallback component
  // When it is rendered
  // Then it should be announced as an alert for screen readers
  it('has role alert for accessibility', () => {
    render(<ErrorFallback />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

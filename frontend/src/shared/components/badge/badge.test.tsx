import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  // Given a Badge with children text
  // When it is rendered
  // Then the text should be visible
  it('renders its children', () => {
    render(<Badge color="success">Nuevo</Badge>)
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })

  // Given a Badge without an explicit color
  // When it is rendered
  // Then it should still render without errors, using the default color
  it('renders with the default color when none is provided', () => {
    render(<Badge>Consulta</Badge>)
    expect(screen.getByText('Consulta')).toBeInTheDocument()
  })
})

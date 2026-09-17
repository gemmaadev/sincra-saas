import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  // Given an EmptyState with only the required title
  // When it is rendered
  // Then only the title should be shown, with no description or action
  it('renders only the title when no optional props are given', () => {
    render(<EmptyState title="Sin clientes todavía" />)
    expect(screen.getByText('Sin clientes todavía')).toBeInTheDocument()
  })

  // Given an EmptyState with title, description and an action
  // When it is rendered
  // Then all three should be visible on screen
  it('renders the description and action when provided', () => {
    render(
      <EmptyState
        title="Sin clientes todavía"
        description="Cuando tengas tu primer cliente, aparecerá aquí."
        action={<button>+ Nuevo cliente</button>}
      />,
    )
    expect(screen.getByText('Cuando tengas tu primer cliente, aparecerá aquí.')).toBeInTheDocument()
    expect(screen.getByText('+ Nuevo cliente')).toBeInTheDocument()
  })
})

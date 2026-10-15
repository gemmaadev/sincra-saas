import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { SidebarItem } from './SidebarItem'

describe('SidebarItem', () => {
  // Given a SidebarItem with a label and a badge
  // When it is rendered
  // Then both the label and the badge count should be visible
  it('renders the label and badge', () => {
    render(
      <MemoryRouter>
        <SidebarItem to="/inbox" icon={<span>icon</span>} label="Bandeja" badge={12} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Bandeja')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  // Given a SidebarItem without a badge prop
  // When it is rendered
  // Then no badge number should appear
  it('does not render a badge when none is provided', () => {
    render(
      <MemoryRouter>
        <SidebarItem to="/clients" icon={<span>icon</span>} label="Clientes" />
      </MemoryRouter>,
    )
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  // Given a disabled SidebarItem
  // When it is rendered
  // Then it should show the label but not be a clickable link
  it('renders a disabled item as non-interactive, without a link', () => {
    render(
      <MemoryRouter>
        <SidebarItem to="/inbox" icon={<span>icon</span>} label="Bandeja" disabled />
      </MemoryRouter>,
    )

    expect(screen.getByText('Bandeja')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

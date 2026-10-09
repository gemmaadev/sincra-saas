import { render, screen } from '@testing-library/react'
import { MapPin } from 'lucide-react'
import { describe, it, expect } from 'vitest'
import { KpiCardsRow } from './KpiCardsRow'
import type { KpiCardProps } from './KpiCard'

function card(label: string, overrides: Partial<KpiCardProps> = {}): KpiCardProps {
  return { icon: MapPin, label, value: '1', ...overrides }
}

describe('KpiCardsRow', () => {
  // Given a list of card specs
  // When the row is rendered
  // Then each card should show its own label and value
  it('renders one KpiCard per spec', () => {
    render(<KpiCardsRow cards={[card('Clientes en el mapa'), card('Zonas activas')]} />)

    expect(screen.getByText('Clientes en el mapa')).toBeInTheDocument()
    expect(screen.getByText('Zonas activas')).toBeInTheDocument()
  })

  // Given 5 cards, like the Orders page uses
  // When the row is rendered
  // Then it should use a 5-column grid, not the 4-column default
  it('adapts the grid to the number of cards', () => {
    const { container } = render(
      <KpiCardsRow cards={[1, 2, 3, 4, 5].map((n) => card(`Card ${n}`))} />,
    )

    expect(container.firstChild).toHaveClass('md:grid-cols-5')
  })
})

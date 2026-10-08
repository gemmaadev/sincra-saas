import { render, screen } from '@testing-library/react'
import { MapPin } from 'lucide-react'
import { describe, it, expect } from 'vitest'
import { KpiCard } from './KpiCard'

describe('KpiCard', () => {
  // Given a KPI with a real value
  // When the card is rendered
  // Then it should show the label and the value, with no skeleton
  it('shows the label and value', () => {
    render(<KpiCard icon={MapPin} label="Clientes en el mapa" value="12" />)

    expect(screen.getByText('Clientes en el mapa')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  // Given a KPI whose data has not loaded yet
  // When the card is rendered as pending
  // Then it should show a skeleton instead of the value
  it('shows a skeleton instead of the value while pending', () => {
    const { container } = render(
      <KpiCard icon={MapPin} label="Pedidos en el mapa" pending value="" />,
    )

    expect(screen.getByText('Pedidos en el mapa')).toBeInTheDocument()
    expect(container.querySelector('[role="presentation"]')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PendingChartCard } from './PendingChartCard'

describe('PendingChartCard', () => {
  // Given a chart that depends on the orders module
  // When the card is rendered
  // Then it should show its title and explain when it will be available
  it('shows the title and the pending message', () => {
    render(<PendingChartCard title="Ingresos por zona" />)

    expect(screen.getByText('Ingresos por zona')).toBeInTheDocument()
    expect(screen.getByText('Disponible cuando exista el módulo de pedidos.')).toBeInTheDocument()
  })
})

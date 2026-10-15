import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatsAiSummary } from './StatsAiSummary'

describe('StatsAiSummary', () => {
  // Given a loaded summary
  // When the block is rendered
  // Then it should show the detected clients and orders counts
  it('shows the detected clients and orders counts', () => {
    render(<StatsAiSummary summary={{ clientsDetected: 3, ordersDetected: 7 }} />)

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('clientes detectados')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('pedidos detectados')).toBeInTheDocument()
  })

  // Given no summary yet (still loading)
  // When the block is rendered
  // Then it should show a dash for each count instead of a blank or a crash
  it('shows a dash for each count when there is no summary yet', () => {
    render(<StatsAiSummary summary={null} />)

    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})

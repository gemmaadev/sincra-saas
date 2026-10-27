import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ZoneSummaryCard } from './ZoneSummaryCard'
import type { ZoneSummary } from '../../types/map.types'

function zoneSummary(zone: string, count: number, percentage: number): ZoneSummary {
  return { zone, count, percentage }
}

describe('ZoneSummaryCard', () => {
  // Given clients grouped in two zones
  // When the card is rendered
  // Then each zone should show its count and percentage
  it('shows the count and percentage of each zone', () => {
    render(
      <ZoneSummaryCard
        zones={[zoneSummary('Barcelona', 3, 75), zoneSummary('Vic', 2, 25)]}
        onSelectZone={vi.fn()}
      />,
    )

    expect(screen.getByText('Barcelona')).toBeInTheDocument()
    expect(screen.getByText('3 clientes - 75 %')).toBeInTheDocument()
    expect(screen.getByText('Vic')).toBeInTheDocument()
    expect(screen.getByText('2 clientes - 25 %')).toBeInTheDocument()
  })

  // Given more zones than the card can show
  // When the card is rendered
  // Then only the biggest ones should appear, plus how many are left
  it('shows only the first zones and counts the rest', () => {
    const zones = Array.from({ length: 8 }, (_, index) => zoneSummary(`Zona ${index + 1}`, 1, 10))

    render(<ZoneSummaryCard zones={zones} onSelectZone={vi.fn()} />)

    expect(screen.getByText('Zona 5')).toBeInTheDocument()
    expect(screen.queryByText('Zona 6')).not.toBeInTheDocument()
    expect(screen.getByText('y 3 zonas más')).toBeInTheDocument()
  })

  // Given no zones
  // When the card is rendered
  // Then an empty message should be shown
  it('shows an empty message when there are no zones', () => {
    render(<ZoneSummaryCard zones={[]} onSelectZone={vi.fn()} />)

    expect(screen.getByText('Todavía no hay clientes.')).toBeInTheDocument()
  })

  // Given a zone in the summary
  // When the user clicks it
  // Then onSelectZone should be called with that zone
  it('calls onSelectZone when a zone is clicked', async () => {
    const onSelectZone = vi.fn()
    render(<ZoneSummaryCard zones={[zoneSummary('Vic', 2, 100)]} onSelectZone={onSelectZone} />)

    await userEvent.setup().click(screen.getByRole('button', { name: /Vic/ }))

    expect(onSelectZone).toHaveBeenCalledWith('Vic')
  })
})

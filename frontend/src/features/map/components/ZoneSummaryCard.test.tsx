import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ZoneSummaryCard } from './ZoneSummaryCard'
import type { ZoneSummary } from '../types/map.types'

function zoneSummary(zone: string, count: number, percentage: number): ZoneSummary {
  return { zone, count, percentage }
}

describe('ZoneSummaryCard', () => {
  // Given clients grouped in two zones
  // When the card is rendered
  // Then each zone should show its count and percentage
  it('shows the count and percentage of each zone', () => {
    render(<ZoneSummaryCard zones={[zoneSummary('Barcelona', 3, 75), zoneSummary('Vic', 1, 25)]} />)

    expect(screen.getByText('Barcelona')).toBeInTheDocument()
    expect(screen.getByText('3 · 75 %')).toBeInTheDocument()
    expect(screen.getByText('Vic')).toBeInTheDocument()
    expect(screen.getByText('1 · 25 %')).toBeInTheDocument()
  })

  // Given more zones than the card can show
  // When the card is rendered
  // Then only the biggest ones should appear, plus how many are left
  it('shows only the first zones and counts the rest', () => {
    const zones = Array.from({ length: 8 }, (_, index) => zoneSummary(`Zona ${index + 1}`, 1, 10))

    render(<ZoneSummaryCard zones={zones} />)

    expect(screen.getByText('Zona 6')).toBeInTheDocument()
    expect(screen.queryByText('Zona 7')).not.toBeInTheDocument()
    expect(screen.getByText('y 2 zonas más')).toBeInTheDocument()
  })

  // Given no zones
  // When the card is rendered
  // Then an empty message should be shown
  it('shows an empty message when there are no zones', () => {
    render(<ZoneSummaryCard zones={[]} />)

    expect(screen.getByText('Todavía no hay clientes.')).toBeInTheDocument()
  })
})

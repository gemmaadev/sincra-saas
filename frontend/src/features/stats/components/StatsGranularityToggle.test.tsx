import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { StatsGranularityToggle } from './StatsGranularityToggle'

describe('StatsGranularityToggle', () => {
  // Given the toggle is set to daily
  // When it is rendered
  // Then "Diario" should be pressed and "Semanal" should not
  it('marks the active granularity as pressed', () => {
    render(<StatsGranularityToggle granularity="daily" onGranularityChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Diario' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Semanal' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  // Given the toggle is rendered
  // When the user clicks "Semanal"
  // Then onGranularityChange should receive "weekly"
  it('reports the chosen granularity', async () => {
    const onGranularityChange = vi.fn()
    render(<StatsGranularityToggle granularity="daily" onGranularityChange={onGranularityChange} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Semanal' }))

    expect(onGranularityChange).toHaveBeenCalledWith('weekly')
  })
})

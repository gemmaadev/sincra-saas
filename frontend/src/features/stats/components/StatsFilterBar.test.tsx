import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StatsFilterBar } from './StatsFilterBar'

function renderBar(props: Partial<React.ComponentProps<typeof StatsFilterBar>> = {}) {
  const handlers = {
    onDateFromChange: vi.fn(),
    onDateToChange: vi.fn(),
  }
  render(
    <StatsFilterBar dateFrom="" dateTo="" isDateRangeInvalid={false} {...handlers} {...props} />,
  )
  return handlers
}

describe('StatsFilterBar', () => {
  // Given the bar is rendered
  // When the user types the start and end dates
  // Then onDateFromChange and onDateToChange should receive them
  it('reports the chosen dates', () => {
    const { onDateFromChange, onDateToChange } = renderBar()

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-31' } })

    expect(onDateFromChange).toHaveBeenCalledWith('2026-10-01')
    expect(onDateToChange).toHaveBeenCalledWith('2026-10-31')
  })

  // Given an end date before the start date
  // When the bar is rendered
  // Then an error should be shown and the pickers should limit each other
  it('shows an error and limits the pickers for an inverted range', () => {
    renderBar({ dateFrom: '2026-10-31', dateTo: '2026-10-01', isDateRangeInvalid: true })

    expect(screen.getByText('Debe ser posterior a la fecha inicial')).toBeInTheDocument()
    expect(screen.getByLabelText('Hasta')).toHaveAttribute('min', '2026-10-31')
    expect(screen.getByLabelText('Desde')).toHaveAttribute('max', '2026-10-01')
  })
})

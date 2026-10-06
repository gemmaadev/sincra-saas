import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MapFilterBar } from './MapFilterBar'

function renderBar(props: Partial<React.ComponentProps<typeof MapFilterBar>> = {}) {
  const handlers = {
    onChannelChange: vi.fn(),
    onFromChange: vi.fn(),
    onToChange: vi.fn(),
    onClear: vi.fn(),
  }
  render(
    <MapFilterBar
      channel=""
      from=""
      to=""
      isDateRangeInvalid={false}
      hasActiveFilters={false}
      {...handlers}
      {...props}
    />,
  )
  return handlers
}

describe('MapFilterBar', () => {
  // Given the bar is rendered
  // When the user picks a channel
  // Then onChannelChange should receive its value
  it('reports the chosen channel', async () => {
    const { onChannelChange } = renderBar()

    await userEvent.setup().selectOptions(screen.getByLabelText('Canal'), 'WHATSAPP')

    expect(onChannelChange).toHaveBeenCalledWith('WHATSAPP')
  })

  // Given the bar is rendered
  // When the user types the start and end dates
  // Then onFromChange and onToChange should receive them
  it('reports the chosen dates', () => {
    const { onFromChange, onToChange } = renderBar()

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-01-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-01-31' } })

    expect(onFromChange).toHaveBeenCalledWith('2026-01-01')
    expect(onToChange).toHaveBeenCalledWith('2026-01-31')
  })

  // Given no filter is active
  // When the bar is rendered
  // Then there should be no "Limpiar filtros" button
  it('hides the clear button when there are no active filters', () => {
    renderBar()

    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument()
  })

  // Given an active filter
  // When the user clicks "Limpiar filtros"
  // Then onClear should be called
  it('clears the filters from the clear button', async () => {
    const { onClear } = renderBar({ hasActiveFilters: true, channel: 'GMAIL' })

    await userEvent.setup().click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  // Given an end date before the start date
  // When the bar is rendered
  // Then an error should be shown on the end date, and the pickers should limit each other
  it('shows an error and limits the pickers for an inverted range', () => {
    renderBar({ from: '2026-02-01', to: '2026-01-01', isDateRangeInvalid: true })

    expect(screen.getByText('Debe ser posterior a la fecha inicial')).toBeInTheDocument()
    expect(screen.getByLabelText('Hasta')).toHaveAttribute('min', '2026-02-01')
    expect(screen.getByLabelText('Desde')).toHaveAttribute('max', '2026-01-01')
  })
})

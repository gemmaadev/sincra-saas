import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CalendarViewToggle } from './CalendarViewToggle'

describe('CalendarViewToggle', () => {
  // Given the month view is active
  // When the toggle is rendered
  // Then only "Mes" should be marked as pressed
  it('marks the active view as pressed', () => {
    render(<CalendarViewToggle view="dayGridMonth" onViewChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Mes' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Semana' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Día' })).toHaveAttribute('aria-pressed', 'false')
  })

  // Given the month view is active
  // When the user clicks "Semana"
  // Then onViewChange should be called with the week view
  it('notifies the new view when clicked', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    render(<CalendarViewToggle view="dayGridMonth" onViewChange={onViewChange} />)

    await user.click(screen.getByRole('button', { name: 'Semana' }))

    expect(onViewChange).toHaveBeenCalledWith('timeGridWeek')
  })

  // Given the day view is active
  // When the user clicks "Día" again
  // Then onViewChange should be called with the day view
  it('notifies the day view when clicked', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    render(<CalendarViewToggle view="timeGridWeek" onViewChange={onViewChange} />)

    await user.click(screen.getByRole('button', { name: 'Día' }))

    expect(onViewChange).toHaveBeenCalledWith('timeGridDay')
  })
})

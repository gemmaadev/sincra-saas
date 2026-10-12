import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CalendarMonthSelect } from './CalendarMonthSelect'

describe('CalendarMonthSelect', () => {
  // Given a current date
  // When the select is rendered
  // Then the trigger button should show that month and year
  it('shows the current month and year on the trigger', () => {
    render(<CalendarMonthSelect currentDate={new Date(2026, 9, 15)} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: /Octubre de 2026/ })).toBeInTheDocument()
  })

  // Given the picker is closed
  // When the component is rendered
  // Then the month grid should not be visible yet
  it('hides the month grid until opened', () => {
    render(<CalendarMonthSelect currentDate={new Date(2026, 9, 15)} onSelect={vi.fn()} />)

    expect(screen.queryByText('Oct')).not.toBeInTheDocument()
  })

  // Given the picker is open on the current year
  // When the user clicks a month
  // Then onSelect should be called with that year and month
  it('selects a month in the current year', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CalendarMonthSelect currentDate={new Date(2026, 9, 15)} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /Octubre de 2026/ }))
    await user.click(screen.getByRole('button', { name: 'Dic' }))

    expect(onSelect).toHaveBeenCalledWith(2026, 11)
  })

  // Given the picker is open
  // When the user navigates to the next year and picks a month
  // Then onSelect should be called with the new year
  it('navigates to another year before selecting a month', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CalendarMonthSelect currentDate={new Date(2026, 9, 15)} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /Octubre de 2026/ }))
    await user.click(screen.getByRole('button', { name: 'Año siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Ene' }))

    expect(onSelect).toHaveBeenCalledWith(2027, 0)
  })
})

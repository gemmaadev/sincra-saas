import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CalendarTypeFilter } from './CalendarTypeFilter'
import type { CalendarEventSource } from '../../types/calendar.types'

describe('CalendarTypeFilter', () => {
  // Given the dropdown is closed
  // When the filter is rendered
  // Then no checkbox should be visible yet
  it('hides the checkboxes until the filter button is clicked', () => {
    render(<CalendarTypeFilter visibleSources={new Set(['MANUAL'])} onToggle={vi.fn()} />)

    expect(screen.queryByLabelText('Seguimiento')).not.toBeInTheDocument()
  })

  // Given the dropdown is open
  // When the filter is rendered with some sources visible and others not
  // Then each checkbox should reflect whether its source is currently shown
  it('reflects which sources are currently visible', async () => {
    const user = userEvent.setup()
    const visibleSources: ReadonlySet<CalendarEventSource> = new Set(['MANUAL'])
    render(<CalendarTypeFilter visibleSources={visibleSources} onToggle={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Filtrar/ }))

    expect(screen.getByLabelText('Seguimiento')).toBeChecked()
    expect(screen.getByLabelText('Entrega pedido')).not.toBeChecked()
  })

  // Given the dropdown is open
  // When the user clicks a checkbox
  // Then onToggle should be called with that source
  it('calls onToggle with the clicked source', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<CalendarTypeFilter visibleSources={new Set(['MANUAL'])} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: /Filtrar/ }))
    await user.click(screen.getByLabelText('Entrega pedido'))

    expect(onToggle).toHaveBeenCalledWith('ORDER')
  })
})

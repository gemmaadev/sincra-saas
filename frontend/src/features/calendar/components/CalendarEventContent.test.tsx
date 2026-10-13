import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CalendarEventContent } from './CalendarEventContent'
import type { EventContentArg } from '@fullcalendar/core'

function buildArg(
  title: string,
  source: string,
  options: { viewType?: string; timeText?: string } = {},
): EventContentArg {
  return {
    event: { title, extendedProps: { source } },
    timeText: options.timeText ?? '',
    view: { type: options.viewType ?? 'dayGridMonth' },
  } as unknown as EventContentArg
}

describe('CalendarEventContent', () => {
  // Given a manual follow-up event
  // When it is rendered
  // Then it should show the event title
  it('shows the event title', () => {
    render(<CalendarEventContent {...buildArg('Llamar a Juan', 'MANUAL')} />)

    expect(screen.getByText('Llamar a Juan')).toBeInTheDocument()
  })

  // Given an order delivery event
  // When it is rendered
  // Then it should use the order source's background color
  it('colors the chip by the order source', () => {
    render(<CalendarEventContent {...buildArg('#42 - Laura', 'ORDER')} />)

    expect(screen.getByTestId('calendar-event-content')).toHaveClass('bg-primary-dark')
  })

  // Given a manual follow-up event
  // When it is rendered
  // Then it should use the manual source's background color
  it('colors the chip by the manual source', () => {
    render(<CalendarEventContent {...buildArg('Llamar a Juan', 'MANUAL')} />)

    expect(screen.getByTestId('calendar-event-content')).toHaveClass('bg-primary')
  })

  // Given the month view
  // When an event is rendered
  // Then no time text should be shown, since the day cell is already small
  it('hides the time in the month view', () => {
    render(<CalendarEventContent {...buildArg('Llamar a Juan', 'MANUAL', { viewType: 'dayGridMonth', timeText: '10:00 - 11:00' })} />)

    expect(screen.queryByText('10:00 - 11:00')).not.toBeInTheDocument()
  })

  // Given the week view
  // When an event is rendered
  // Then the time range should be shown, so the block reads like Google Calendar's
  it('shows the time in the week view', () => {
    render(<CalendarEventContent {...buildArg('Llamar a Juan', 'MANUAL', { viewType: 'timeGridWeek', timeText: '10:00 - 11:00' })} />)

    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument()
  })

  // Given the day view
  // When an event is rendered
  // Then the time range should be shown too
  it('shows the time in the day view', () => {
    render(<CalendarEventContent {...buildArg('Llamar a Juan', 'MANUAL', { viewType: 'timeGridDay', timeText: '10:00 - 11:00' })} />)

    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument()
  })
})

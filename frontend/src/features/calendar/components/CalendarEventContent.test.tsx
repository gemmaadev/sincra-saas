import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CalendarEventContent } from './CalendarEventContent'
import type { EventContentArg } from '@fullcalendar/core'

function buildArg(title: string, source: string): EventContentArg {
  return {
    event: { title, extendedProps: { source } },
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

    expect(screen.getByText('#42 - Laura').parentElement).toHaveClass('bg-primary-dark')
  })

  // Given a manual follow-up event
  // When it is rendered
  // Then it should use the manual source's background color
  it('colors the chip by the manual source', () => {
    render(<CalendarEventContent {...buildArg('Llamar a Juan', 'MANUAL')} />)

    expect(screen.getByText('Llamar a Juan').parentElement).toHaveClass('bg-primary')
  })
})

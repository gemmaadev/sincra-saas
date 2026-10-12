import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CalendarUpcomingEvents } from './CalendarUpcomingEvents'
import type { CalendarItem } from '../types/calendar.types'

function buildEvent(overrides: Partial<CalendarItem>): CalendarItem {
  return {
    id: 'event-1',
    title: 'Llamar a Juan',
    description: null,
    date: new Date().toISOString(),
    source: 'MANUAL',
    clientId: null,
    clientName: null,
    orderId: null,
    orderLabel: null,
    orderNumber: null,
    editable: true,
    ...overrides,
  }
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

describe('CalendarUpcomingEvents', () => {
  // Given no events at all
  // When CalendarUpcomingEvents is rendered
  // Then it should show an empty-state message
  it('shows an empty state when there are no events', () => {
    render(<CalendarUpcomingEvents events={[]} onEventClick={vi.fn()} />)
    expect(screen.getByText('No hay eventos próximos.')).toBeInTheDocument()
  })

  // Given an event in the past and an event in the future
  // When CalendarUpcomingEvents is rendered
  // Then only the future event should be shown
  it('only shows events from now onwards', () => {
    const pastEvent = buildEvent({
      id: 'past-1',
      title: 'Evento pasado',
      date: new Date(Date.now() - ONE_DAY_MS).toISOString(),
    })
    const futureEvent = buildEvent({
      id: 'future-1',
      title: 'Evento futuro',
      date: new Date(Date.now() + ONE_DAY_MS).toISOString(),
    })

    render(<CalendarUpcomingEvents events={[pastEvent, futureEvent]} onEventClick={vi.fn()} />)

    expect(screen.getByText('Evento futuro')).toBeInTheDocument()
    expect(screen.queryByText('Evento pasado')).not.toBeInTheDocument()
  })

  // Given an event linked to a client
  // When CalendarUpcomingEvents is rendered
  // Then the client's name should be shown alongside the event
  it('shows the client name when the event has one', () => {
    const event = buildEvent({
      clientName: 'Laura García',
      date: new Date(Date.now() + ONE_DAY_MS).toISOString(),
    })

    render(<CalendarUpcomingEvents events={[event]} onEventClick={vi.fn()} />)

    expect(screen.getByText(/Laura García/)).toBeInTheDocument()
  })

  // Given an upcoming event
  // When the user clicks it
  // Then onEventClick should be called with that event
  it('calls onEventClick when an event is clicked', async () => {
    const user = userEvent.setup()
    const onEventClick = vi.fn()
    const event = buildEvent({ date: new Date(Date.now() + ONE_DAY_MS).toISOString() })

    render(<CalendarUpcomingEvents events={[event]} onEventClick={onEventClick} />)
    await user.click(screen.getByRole('button', { name: /Llamar a Juan/ }))

    expect(onEventClick).toHaveBeenCalledWith(event)
  })

  // Given an order delivery (orderNumber set)
  // When CalendarUpcomingEvents is rendered
  // Then it should show the order number instead of a client avatar
  it('shows the order number for an order delivery', () => {
    const event = buildEvent({
      title: '#42 - Laura',
      orderNumber: 42,
      date: new Date(Date.now() + ONE_DAY_MS).toISOString(),
    })

    render(<CalendarUpcomingEvents events={[event]} onEventClick={vi.fn()} />)

    expect(screen.getByText('#42')).toBeInTheDocument()
  })

  // Given an event with no client and no order linked
  // When CalendarUpcomingEvents is rendered
  // Then it should not show an initials avatar (misleading, implies a person), just a generic icon
  it('does not show an initials avatar for an event with no client or order', () => {
    const event = buildEvent({
      title: 'Llamar a Juan',
      clientName: null,
      orderNumber: null,
      date: new Date(Date.now() + ONE_DAY_MS).toISOString(),
    })

    render(<CalendarUpcomingEvents events={[event]} onEventClick={vi.fn()} />)

    expect(screen.queryByText('LA')).not.toBeInTheDocument()
  })

  // Given more than 5 upcoming events
  // When CalendarUpcomingEvents is rendered
  // Then only the first 5 should be shown
  it('caps the list at 5 events', () => {
    const events = Array.from({ length: 7 }, (_, index) =>
      buildEvent({
        id: `event-${index}`,
        title: `Evento ${index}`,
        date: new Date(Date.now() + (index + 1) * ONE_DAY_MS).toISOString(),
      }),
    )

    render(<CalendarUpcomingEvents events={events} onEventClick={vi.fn()} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })
})

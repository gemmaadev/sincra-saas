import { describe, it, expect } from 'vitest'
import { toCalendarEventFormValues } from './toCalendarEventFormValues'
import type { CalendarItem } from '../types/calendar.types'

function buildEvent(overrides: Partial<CalendarItem>): CalendarItem {
  return {
    id: 'event-1',
    title: 'Llamar a Juan',
    description: 'Confirmar talla',
    date: '2026-10-15T10:05:00.000Z',
    endDate: '2026-10-15T10:05:00.000Z',
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

describe('toCalendarEventFormValues', () => {
  // Given no event and no initial date
  // When building the form values
  // Then every field should be empty and linkType should be "none"
  it('returns empty values for a brand new event', () => {
    const values = toCalendarEventFormValues()

    expect(values.title).toBe('')
    expect(values.description).toBe('')
    expect(values.linkType).toBe('none')
    expect(values.clientId).toBe('')
    expect(values.orderId).toBe('')
  })

  // Given an initial date (e.g. from clicking an empty calendar slot)
  // When building the form values for a new event
  // Then the date and time should come from it
  it('prefills the date and time from the initial date when creating', () => {
    const values = toCalendarEventFormValues(undefined, new Date('2026-10-15T09:05:00'))

    expect(values.date).toBe('2026-10-15')
    expect(values.time).toBe('09:05')
  })

  // Given an initial date and no event
  // When building the form values for a new event
  // Then the end should default to one hour after the start
  it('defaults the end to one hour after the start when creating', () => {
    const values = toCalendarEventFormValues(undefined, new Date('2026-10-15T09:05:00'))

    expect(values.endDate).toBe('2026-10-15')
    expect(values.endTime).toBe('10:05')
  })

  // Given an existing event
  // When building the form values for editing it
  // Then the title, description and date/time should come from the event
  it('fills the form from an existing event', () => {
    const event = buildEvent({ title: 'Llamar a Juan', date: '2026-10-15T09:05:00' })

    const values = toCalendarEventFormValues(event)

    expect(values.title).toBe('Llamar a Juan')
    expect(values.description).toBe('Confirmar talla')
    expect(values.date).toBe('2026-10-15')
    expect(values.time).toBe('09:05')
  })

  // Given an existing event with an end date later than its start
  // When building the form values for editing it
  // Then the end date and time should come from the event, not default to +1h
  it('prefills the end date and time from an existing event', () => {
    const event = buildEvent({
      date: '2026-10-15T09:05:00',
      endDate: '2026-10-17T18:00:00',
    })

    const values = toCalendarEventFormValues(event)

    expect(values.endDate).toBe('2026-10-17')
    expect(values.endTime).toBe('18:00')
  })

  // Given an event linked to a client
  // When building the form values
  // Then linkType should be "client" and the client fields should be filled
  it('resolves linkType as client when the event has a clientId', () => {
    const event = buildEvent({ clientId: 'client-1', clientName: 'Laura' })

    const values = toCalendarEventFormValues(event)

    expect(values.linkType).toBe('client')
    expect(values.clientId).toBe('client-1')
    expect(values.clientName).toBe('Laura')
  })

  // Given an event linked to an order
  // When building the form values
  // Then linkType should be "order" and the order fields should be filled
  it('resolves linkType as order when the event has an orderId', () => {
    const event = buildEvent({ orderId: 'order-1', orderLabel: 'Pedido #42 - Laura' })

    const values = toCalendarEventFormValues(event)

    expect(values.linkType).toBe('order')
    expect(values.orderId).toBe('order-1')
    expect(values.orderLabel).toBe('Pedido #42 - Laura')
  })

  // Given an event linked to neither a client nor an order
  // When building the form values
  // Then linkType should be "none"
  it('resolves linkType as none when the event has no link', () => {
    const values = toCalendarEventFormValues(buildEvent({}))

    expect(values.linkType).toBe('none')
  })
})

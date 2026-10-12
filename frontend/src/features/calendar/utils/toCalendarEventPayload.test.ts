import { describe, it, expect } from 'vitest'
import { toCalendarEventPayload } from './toCalendarEventPayload'
import type { CalendarEventFormValues } from '../types/calendar.types'

const baseValues: CalendarEventFormValues = {
  title: '  Llamar a Juan  ',
  date: '2026-10-15',
  time: '10:00',
  description: '  Confirmar talla  ',
  linkType: 'none',
  clientId: '',
  clientName: '',
  orderId: '',
  orderLabel: '',
}

describe('toCalendarEventPayload', () => {
  // Given a title with surrounding spaces
  // When it is converted to a payload
  // Then it should be trimmed
  it('trims the title', () => {
    expect(toCalendarEventPayload(baseValues).title).toBe('Llamar a Juan')
  })

  // Given a date and a time
  // When they are converted to a payload
  // Then they should be combined into a single ISO datetime
  it('combines the date and time into one ISO datetime', () => {
    const payload = toCalendarEventPayload(baseValues)

    expect(payload.date).toBe(new Date('2026-10-15T10:00').toISOString())
  })

  // Given an empty description
  // When it is converted to a payload
  // Then it should be null, not an empty string
  it('sends an empty description as null', () => {
    const payload = toCalendarEventPayload({ ...baseValues, description: '   ' })

    expect(payload.description).toBeNull()
  })

  // Given linkType is "client"
  // When it is converted to a payload
  // Then clientId should be carried over and orderId should be null
  it('sends only clientId when linked to a client', () => {
    const payload = toCalendarEventPayload({
      ...baseValues,
      linkType: 'client',
      clientId: 'client-1',
      orderId: 'order-1',
    })

    expect(payload).toMatchObject({ clientId: 'client-1', orderId: null })
  })

  // Given linkType is "order"
  // When it is converted to a payload
  // Then orderId should be carried over and clientId should be null
  it('sends only orderId when linked to an order', () => {
    const payload = toCalendarEventPayload({
      ...baseValues,
      linkType: 'order',
      clientId: 'client-1',
      orderId: 'order-1',
    })

    expect(payload).toMatchObject({ clientId: null, orderId: 'order-1' })
  })

  // Given linkType is "none"
  // When it is converted to a payload
  // Then both clientId and orderId should be null, even if the form carries leftover ids
  it('sends both clientId and orderId as null when there is no link', () => {
    const payload = toCalendarEventPayload({
      ...baseValues,
      linkType: 'none',
      clientId: 'client-1',
      orderId: 'order-1',
    })

    expect(payload).toMatchObject({ clientId: null, orderId: null })
  })
})

import type { CalendarEventFormValues } from '../types/calendar.types'

export interface CalendarEventPayload {
  title: string
  description: string | null
  date: string
  clientId: string | null
  orderId: string | null
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toCalendarEventPayload(values: CalendarEventFormValues): CalendarEventPayload {
  return {
    title: values.title.trim(),
    description: emptyToNull(values.description),
    date: new Date(`${values.date}T${values.time}`).toISOString(),
    clientId: values.linkType === 'client' ? values.clientId : null,
    orderId: values.linkType === 'order' ? values.orderId : null,
  }
}

import { emptyToNull } from '@/shared/utils'
import type { CalendarEventFormValues } from '../types/calendar.types'

export interface CalendarEventPayload {
  title: string
  description: string | null
  date: string
  endDate: string
  clientId: string | null
  orderId: string | null
}

export function toCalendarEventPayload(values: CalendarEventFormValues): CalendarEventPayload {
  return {
    title: values.title.trim(),
    description: emptyToNull(values.description),
    date: new Date(`${values.date}T${values.time}`).toISOString(),
    endDate: new Date(`${values.endDate}T${values.endTime}`).toISOString(),
    clientId: values.linkType === 'client' ? values.clientId : null,
    orderId: values.linkType === 'order' ? values.orderId : null,
  }
}

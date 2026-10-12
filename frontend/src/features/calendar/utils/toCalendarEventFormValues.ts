import type {
  CalendarEventFormValues,
  CalendarEventLinkType,
  CalendarItem,
} from '../types/calendar.types'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toTimeInputValue(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function resolveLinkType(event?: CalendarItem): CalendarEventLinkType {
  if (event?.clientId) return 'client'
  if (event?.orderId) return 'order'
  return 'none'
}

export function toCalendarEventFormValues(
  event?: CalendarItem,
  initialDate?: Date,
): CalendarEventFormValues {
  const date = event ? new Date(event.date) : (initialDate ?? new Date())

  return {
    title: event?.title ?? '',
    date: toDateInputValue(date),
    time: toTimeInputValue(date),
    description: event?.description ?? '',
    linkType: resolveLinkType(event),
    clientId: event?.clientId ?? '',
    clientName: event?.clientName ?? '',
    orderId: event?.orderId ?? '',
    orderLabel: event?.orderLabel ?? '',
  }
}

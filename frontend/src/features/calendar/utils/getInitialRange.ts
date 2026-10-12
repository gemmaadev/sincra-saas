import type { CalendarEventsFilters } from '../types/calendar.types'

export function getInitialRange(): CalendarEventsFilters {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() }
}

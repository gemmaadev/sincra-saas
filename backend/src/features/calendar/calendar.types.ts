import type { CalendarEventSource } from '../../generated/prisma/client'

export interface CreateCalendarEventInput {
  title: string
  description?: string | null
  date: Date
  clientId?: string | null
  orderId?: string | null
}

export interface UpdateCalendarEventInput {
  title?: string
  description?: string | null
  date?: Date
  clientId?: string | null
  orderId?: string | null
}

export interface ListCalendarEventsFilters {
  dateFrom: string
  dateTo: string
}

// One shape for both calendar events and orders shown on the calendar, so the frontend can render
// them the same way. editable is false for orders: they're changed on the order, not here.
export interface CalendarItem {
  id: string
  title: string
  description: string | null
  date: Date
  source: CalendarEventSource
  clientId: string | null
  clientName: string | null
  orderId: string | null
  editable: boolean
}

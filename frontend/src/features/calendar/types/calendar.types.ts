export type CalendarEventSource = 'MANUAL' | 'ORDER' | 'AI' | 'GOOGLE' | 'OUTLOOK'
export type CalendarViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
export interface CalendarItem {
  id: string
  title: string
  description: string | null
  date: string
  endDate: string
  source: CalendarEventSource
  clientId: string | null
  clientName: string | null
  orderId: string | null
  orderLabel: string | null
  orderNumber: number | null
  editable: boolean
}

export interface CalendarEventsFilters {
  dateFrom: string
  dateTo: string
}

export type CalendarEventLinkType = 'client' | 'order' | 'none'

export interface CalendarEventFormValues {
  title: string
  date: string
  time: string
  endDate: string
  endTime: string
  description: string
  linkType: CalendarEventLinkType
  clientId: string
  clientName: string
  orderId: string
  orderLabel: string
}

export interface CalendarEventMutationResponse {
  event: { id: string }
}

export interface CalendarClientSearchResult {
  id: string
  name: string
  email: string | null
  phone: string | null
}

export interface CalendarOrderSearchResult {
  id: string
  number: number
  clientName: string
}

export type CalendarEventSource = 'MANUAL' | 'ORDER' | 'AI' | 'GOOGLE' | 'OUTLOOK'
export type CalendarViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
export interface CalendarItem {
  id: string
  title: string
  description: string | null
  date: string
  source: CalendarEventSource
  clientId: string | null
  clientName: string | null
  orderId: string | null
  editable: boolean
}

export interface CalendarEventsFilters {
  dateFrom: string
  dateTo: string
}

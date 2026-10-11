import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DatesSetArg } from '@fullcalendar/core'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { getInitialRange } from '../utils/getInitialRange'
import type { CalendarEventsFilters } from '../types/calendar.types'

export function CalendarView() {
  const [range, setRange] = useState<CalendarEventsFilters>(getInitialRange)
  const { data: events } = useCalendarEvents(range)

  function handleDatesSet(arg: DatesSetArg) {
    setRange({ dateFrom: arg.start.toISOString(), dateTo: arg.end.toISOString() })
  }

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        height="auto"
        datesSet={handleDatesSet}
        events={(events ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          start: item.date,
          editable: item.editable,
          extendedProps: { source: item.source, clientId: item.clientId, orderId: item.orderId },
        }))}
      />
    </div>
  )
}

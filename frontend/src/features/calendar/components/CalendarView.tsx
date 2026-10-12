import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DatesSetArg } from '@fullcalendar/core'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { getInitialRange } from '../utils/getInitialRange'
import { CalendarNavigation } from './CalendarNavigation'
import { CalendarViewToggle } from './CalendarViewToggle'
import { CalendarMonthSelect } from './CalendarMonthSelect'
import { CalendarEventContent } from './CalendarEventContent'
import type { CalendarEventsFilters, CalendarViewMode } from '../types/calendar.types'

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null)
  const [range, setRange] = useState<CalendarEventsFilters>(getInitialRange)
  const [view, setView] = useState<CalendarViewMode>('dayGridMonth')
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: events } = useCalendarEvents(range)

  function handleDatesSet(arg: DatesSetArg) {
    setRange({ dateFrom: arg.start.toISOString(), dateTo: arg.end.toISOString() })
    setCurrentDate(arg.view.currentStart)
  }

  function handleViewChange(nextView: CalendarViewMode) {
    setView(nextView)
    calendarRef.current?.getApi().changeView(nextView)
  }

  function handleMonthSelect(year: number, month: number) {
    calendarRef.current?.getApi().gotoDate(new Date(year, month, 1))
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-neutral-100 bg-white p-4 shadow-md">
      <div className="flex items-center gap-3">
        <CalendarMonthSelect currentDate={currentDate} onSelect={handleMonthSelect} />
        <CalendarViewToggle view={view} onViewChange={handleViewChange} />
        <CalendarNavigation
          onPrev={() => calendarRef.current?.getApi().prev()}
          onNext={() => calendarRef.current?.getApi().next()}
          onToday={() => calendarRef.current?.getApi().today()}
        />
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        locale="es"
        height="auto"
        datesSet={handleDatesSet}
        eventContent={CalendarEventContent}
        eventBackgroundColor="transparent"
        eventBorderColor="transparent"
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

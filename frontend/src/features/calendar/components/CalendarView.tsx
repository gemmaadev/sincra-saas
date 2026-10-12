import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import type { DatesSetArg } from '@fullcalendar/core'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { getInitialRange } from '../utils/getInitialRange'
import { CalendarNavigation } from './CalendarNavigation'
import { CalendarViewToggle } from './CalendarViewToggle'
import { CalendarMonthSelect } from './CalendarMonthSelect'
import { CalendarEventContent } from './CalendarEventContent'
import { CalendarTypeFilter } from './CalendarTypeFilter'
import { CalendarUpcomingEvents } from './CalendarUpcomingEvents'
import type {
  CalendarEventSource,
  CalendarEventsFilters,
  CalendarViewMode,
} from '../types/calendar.types'

const DEFAULT_VISIBLE_SOURCES: CalendarEventSource[] = ['MANUAL', 'ORDER', 'AI']

// Stable references: FullCalendar treats a new array identity on these props as a config
// change and reinitializes itself, which re-fires datesSet and can loop with our own state.
const CALENDAR_PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin]
const CALENDAR_LOCALES = [esLocale]

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null)
  const [range, setRange] = useState<CalendarEventsFilters>(getInitialRange)
  const [view, setView] = useState<CalendarViewMode>('dayGridMonth')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [visibleSources, setVisibleSources] = useState<Set<CalendarEventSource>>(
    new Set(DEFAULT_VISIBLE_SOURCES),
  )
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

  function handleToggleSource(source: CalendarEventSource) {
    setVisibleSources((prev) => {
      const next = new Set(prev)
      if (next.has(source)) next.delete(source)
      else next.add(source)
      return next
    })
  }

  const visibleEvents = (events ?? []).filter((item) => visibleSources.has(item.source))

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-4 rounded-card border border-neutral-100 bg-white p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <CalendarMonthSelect currentDate={currentDate} onSelect={handleMonthSelect} />
            <CalendarViewToggle view={view} onViewChange={handleViewChange} />
            <CalendarNavigation
              onPrev={() => calendarRef.current?.getApi().prev()}
              onNext={() => calendarRef.current?.getApi().next()}
              onToday={() => calendarRef.current?.getApi().today()}
            />
          </div>
          <CalendarTypeFilter visibleSources={visibleSources} onToggle={handleToggleSource} />
        </div>
        <FullCalendar
          ref={calendarRef}
          plugins={CALENDAR_PLUGINS}
          initialView="dayGridMonth"
          headerToolbar={false}
          locales={CALENDAR_LOCALES}
          locale="es"
          height="auto"
          datesSet={handleDatesSet}
          eventContent={CalendarEventContent}
          eventBackgroundColor="transparent"
          eventBorderColor="transparent"
          events={visibleEvents.map((item) => ({
            id: item.id,
            title: item.title,
            start: item.date,
            editable: item.editable,
            extendedProps: { source: item.source, clientId: item.clientId, orderId: item.orderId },
          }))}
        />
      </div>
      <CalendarUpcomingEvents events={visibleEvents} />
    </div>
  )
}

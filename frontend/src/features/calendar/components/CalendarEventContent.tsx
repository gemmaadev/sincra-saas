import type { EventContentArg } from '@fullcalendar/core'
import { CALENDAR_SOURCE_BACKGROUND_CLASSES, CALENDAR_SOURCE_ICONS } from '../calendarSource.constants'
import type { CalendarEventSource } from '../types/calendar.types'

export function CalendarEventContent({ event }: EventContentArg) {
  const source = event.extendedProps.source as CalendarEventSource
  const Icon = CALENDAR_SOURCE_ICONS[source]

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-1 overflow-hidden rounded px-2 py-0.5 text-sm font-medium text-white ${CALENDAR_SOURCE_BACKGROUND_CLASSES[source]}`}
    >
      <Icon size={12} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{event.title}</span>
    </div>
  )
}

import type { EventContentArg } from '@fullcalendar/core'
import { CALENDAR_SOURCE_BACKGROUND_CLASSES, CALENDAR_SOURCE_ICONS } from '../calendarSource.constants'
import type { CalendarEventSource } from '../types/calendar.types'

export function CalendarEventContent({ event, timeText, view }: EventContentArg) {
  const source = event.extendedProps.source as CalendarEventSource
  const Icon = CALENDAR_SOURCE_ICONS[source]
  const showTime = view.type !== 'dayGridMonth' && timeText

  return (
    <div
      data-testid="calendar-event-content"
      className={`flex h-full w-full min-w-0 cursor-pointer flex-col gap-0.5 overflow-hidden rounded px-2 py-0.5 text-sm font-medium text-white ${CALENDAR_SOURCE_BACKGROUND_CLASSES[source]}`}
    >
      <span className="flex min-w-0 items-center gap-1">
        <Icon size={12} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">{event.title}</span>
      </span>
      {showTime && <span className="truncate text-xs font-normal opacity-90">{timeText}</span>}
    </div>
  )
}

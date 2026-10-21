import { Avatar, Spinner } from '@/shared/components'
import { formatTime } from '@/shared/utils'
import { CALENDAR_SOURCE_ICONS } from '../calendarSource.constants'
import type { CalendarItem } from '../types/calendar.types'

const MAX_UPCOMING_EVENTS = 5

interface CalendarUpcomingEventsProps {
  events: CalendarItem[]
  isLoading: boolean
  onEventClick: (event: CalendarItem) => void
}

export function CalendarUpcomingEvents({
  events,
  isLoading,
  onEventClick,
}: CalendarUpcomingEventsProps) {
  const now = new Date()
  const upcomingEvents = events
    .filter((item) => new Date(item.date) >= now)
    .slice(0, MAX_UPCOMING_EVENTS)

  return (
    <div className="flex w-full flex-col gap-4 rounded-card border border-neutral-100 bg-white p-4 shadow-md lg:w-80 lg:shrink-0">
      <h2 className="text-sm font-semibold text-ink">Próximos eventos</h2>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner label="Cargando eventos" />
        </div>
      ) : upcomingEvents.length === 0 ? (
        <p className="text-sm text-ink-muted">No hay eventos próximos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {upcomingEvents.map((item) => {
            const SourceIcon = CALENDAR_SOURCE_ICONS[item.source]

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onEventClick(item)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg text-left transition-colors hover:bg-neutral-50"
                >
                  {item.orderNumber !== null ? (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary-dark bg-primary-dark text-xs font-semibold text-white">
                      #{item.orderNumber}
                    </div>
                  ) : item.clientName ? (
                    <Avatar name={item.clientName} size="sm" />
                  ) : (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-ink-muted">
                      <SourceIcon size={14} />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-ink">{item.title}</span>
                    <span className="truncate text-xs text-ink-muted">
                      {item.clientName ? `${item.clientName} · ` : ''}
                      {formatTime(new Date(item.date))}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

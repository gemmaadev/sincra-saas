import { Avatar } from '@/shared/components'
import { formatTime } from '@/shared/utils'
import type { CalendarItem } from '../types/calendar.types'

const MAX_UPCOMING_EVENTS = 5

interface CalendarUpcomingEventsProps {
  events: CalendarItem[]
}

export function CalendarUpcomingEvents({ events }: CalendarUpcomingEventsProps) {
  const now = new Date()
  const upcomingEvents = events
    .filter((item) => new Date(item.date) >= now)
    .slice(0, MAX_UPCOMING_EVENTS)

  return (
    <div className="flex w-full flex-col gap-4 rounded-card border border-neutral-100 bg-white p-4 shadow-md lg:w-80 lg:shrink-0">
      <h2 className="text-sm font-semibold text-ink">Próximos eventos</h2>

      {upcomingEvents.length === 0 ? (
        <p className="text-sm text-ink-muted">No hay eventos próximos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {upcomingEvents.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <Avatar name={item.clientName ?? item.title} size="sm" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-ink">{item.title}</span>
                <span className="truncate text-xs text-ink-muted">
                  {item.clientName ? `${item.clientName} · ` : ''}
                  {formatTime(new Date(item.date))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

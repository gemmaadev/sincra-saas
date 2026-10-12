import type { CalendarViewMode } from '../types/calendarView.types'

const baseClasses = 'px-4 py-1.5 text-sm font-medium transition-colors'

const VIEWS: { value: CalendarViewMode; label: string }[] = [
  { value: 'dayGridMonth', label: 'Mes' },
  { value: 'timeGridWeek', label: 'Semana' },
  { value: 'timeGridDay', label: 'Día' },
]

interface CalendarViewToggleProps {
  view: CalendarViewMode
  onViewChange: (view: CalendarViewMode) => void
}

export function CalendarViewToggle({ view, onViewChange }: CalendarViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Vista del calendario"
      className="inline-flex overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md"
    >
      {VIEWS.map(({ value, label }) => {
        const isActive = value === view

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onViewChange(value)}
            className={`${baseClasses} ${isActive ? 'bg-primary text-white' : 'text-ink-muted hover:bg-neutral-50'}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

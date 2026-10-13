import { useDisclosure, useClickOutside } from '@mantine/hooks'
import { ListFilter, ChevronDown } from 'lucide-react'
import { Checkbox } from '@/shared/components'
import { CALENDAR_SOURCE_LABELS } from '../calendarSource.constants'
import type { CalendarEventSource } from '../types/calendar.types'

const FILTERABLE_SOURCES: CalendarEventSource[] = ['MANUAL', 'ORDER', 'AI']

interface CalendarTypeFilterProps {
  visibleSources: ReadonlySet<CalendarEventSource>
  onToggle: (source: CalendarEventSource) => void
}

export function CalendarTypeFilter({ visibleSources, onToggle }: CalendarTypeFilterProps) {
  const [isOpen, { toggle, close }] = useDisclosure(false)
  const panelRef = useClickOutside<HTMLDivElement>(close)

  return (
    <div ref={panelRef} className="relative inline-block">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-100 bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-md transition-colors hover:bg-neutral-50"
      >
        <ListFilter size={16} className="text-ink-muted" />
        Filtrar
        <ChevronDown size={16} className="text-ink-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 flex w-52 flex-col gap-2 rounded-lg border border-neutral-100 bg-white p-3 shadow-lg">
          {FILTERABLE_SOURCES.map((source) => (
            <Checkbox
              key={source}
              label={CALENDAR_SOURCE_LABELS[source]}
              checked={visibleSources.has(source)}
              onChange={() => onToggle(source)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

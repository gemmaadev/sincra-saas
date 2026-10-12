import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarNavigationProps {
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarNavigation({ onPrev, onNext, onToday }: CalendarNavigationProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md">
      <button
        type="button"
        aria-label="Periodo anterior"
        onClick={onPrev}
        className="px-2 py-1.5 text-ink-muted transition-colors hover:bg-neutral-50"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={onToday}
        className="border-x border-neutral-100 px-4 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-neutral-50"
      >
        Hoy
      </button>
      <button
        type="button"
        aria-label="Periodo siguiente"
        onClick={onNext}
        className="px-2 py-1.5 text-ink-muted transition-colors hover:bg-neutral-50"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

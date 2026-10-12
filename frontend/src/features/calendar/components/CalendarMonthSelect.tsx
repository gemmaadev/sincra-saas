import { useState } from 'react'
import { useDisclosure, useClickOutside } from '@mantine/hooks'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrentLabel } from '../utils/formatCurrentLabel'

const MONTH_LABELS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

interface CalendarMonthSelectProps {
  currentDate: Date
  onSelect: (year: number, month: number) => void
}

export function CalendarMonthSelect({ currentDate, onSelect }: CalendarMonthSelectProps) {
  const [isOpen, { toggle: toggleOpen, close }] = useDisclosure(false)
  const panelRef = useClickOutside<HTMLDivElement>(close)
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear())

  function handleToggle() {
    if (!isOpen) setPickerYear(currentDate.getFullYear())
    toggleOpen()
  }

  function handleMonthClick(month: number) {
    onSelect(pickerYear, month)
    close()
  }

  return (
    <div ref={panelRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-100 bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-md transition-colors hover:bg-neutral-50"
      >
        <Calendar size={16} className="text-ink-muted" />
        {formatCurrentLabel(currentDate)}
        <ChevronDown size={16} className="text-ink-muted" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-2 flex w-56 flex-col gap-2 rounded-lg border border-neutral-100 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Año anterior"
              onClick={() => setPickerYear((year) => year - 1)}
              className="rounded p-1 text-ink-muted hover:bg-neutral-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-ink">{pickerYear}</span>
            <button
              type="button"
              aria-label="Año siguiente"
              onClick={() => setPickerYear((year) => year + 1)}
              className="rounded p-1 text-ink-muted hover:bg-neutral-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTH_LABELS.map((label, month) => {
              const isActive =
                pickerYear === currentDate.getFullYear() && month === currentDate.getMonth()

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleMonthClick(month)}
                  className={`rounded px-2 py-1.5 text-sm transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-ink hover:bg-neutral-50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

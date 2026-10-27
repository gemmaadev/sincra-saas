import { SincraButton } from '@/shared/components'
import { CalendarClientSearch } from './CalendarClientSearch'
import { CalendarOrderSearch } from './CalendarOrderSearch'
import type {
  CalendarClientSearchResult,
  CalendarEventLinkType,
  CalendarOrderSearchResult,
} from '../types/calendar.types'

const LINK_TYPES: { value: CalendarEventLinkType; label: string }[] = [
  { value: 'client', label: 'Cliente' },
  { value: 'order', label: 'Pedido' },
  { value: 'none', label: 'Ninguno' },
]

interface CalendarEventLinkFieldProps {
  linkType: CalendarEventLinkType
  clientName: string
  orderLabel: string
  onLinkTypeChange: (linkType: CalendarEventLinkType) => void
  onSelectClient: (client: CalendarClientSearchResult) => void
  onSelectOrder: (order: CalendarOrderSearchResult) => void
  onClearSelection: () => void
}

export function CalendarEventLinkField({
  linkType,
  clientName,
  orderLabel,
  onLinkTypeChange,
  onSelectClient,
  onSelectOrder,
  onClearSelection,
}: CalendarEventLinkFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-ink">Vincular a</span>
      <div
        role="group"
        aria-label="Vincular a"
        className="inline-flex w-fit overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md"
      >
        {LINK_TYPES.map(({ value, label }) => {
          const isActive = value === linkType

          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onLinkTypeChange(value)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-ink-muted hover:bg-neutral-50'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {linkType === 'client' &&
        (clientName ? (
          <div className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2">
            <span className="text-ink">{clientName}</span>
            <SincraButton type="button" variant="text" size="sm" onClick={onClearSelection}>
              Cambiar
            </SincraButton>
          </div>
        ) : (
          <CalendarClientSearch onSelect={onSelectClient} />
        ))}

      {linkType === 'order' &&
        (orderLabel ? (
          <div className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2">
            <span className="text-ink">{orderLabel}</span>
            <SincraButton type="button" variant="text" size="sm" onClick={onClearSelection}>
              Cambiar
            </SincraButton>
          </div>
        ) : (
          <CalendarOrderSearch onSelect={onSelectOrder} />
        ))}
    </div>
  )
}

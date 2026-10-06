import { Input, SincraButton } from '@/shared/components'
import { ChannelSelect } from '@/shared/channels/ChannelSelect'
import type { ChannelFilter } from '@/features/clients/types/client.types'

interface MapFilterBarProps {
  channel: ChannelFilter | ''
  from: string
  to: string
  isDateRangeInvalid: boolean
  hasActiveFilters: boolean
  onChannelChange: (value: ChannelFilter | '') => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onClear: () => void
}

export function MapFilterBar({
  channel,
  from,
  to,
  isDateRangeInvalid,
  hasActiveFilters,
  onChannelChange,
  onFromChange,
  onToChange,
  onClear,
}: MapFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <ChannelSelect
          id="map-filter-channel"
          size="sm"
          value={channel}
          onChange={(value) => onChannelChange(value as ChannelFilter | '')}
        />
      </div>
      <div className="w-44">
        <Input
          label="Desde"
          type="date"
          size="sm"
          max={to || undefined}
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
        />
      </div>
      <div className="w-44">
        <Input
          label="Hasta"
          type="date"
          size="sm"
          min={from || undefined}
          error={isDateRangeInvalid ? 'Debe ser posterior a la fecha inicial' : undefined}
          value={to}
          onChange={(event) => onToChange(event.target.value)}
        />
      </div>
      {hasActiveFilters && (
        <SincraButton type="button" variant="text" size="sm" onClick={onClear}>
          Limpiar filtros
        </SincraButton>
      )}
    </div>
  )
}

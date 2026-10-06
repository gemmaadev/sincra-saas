import { Input, Select, SincraButton } from '@/shared/components'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import type { ChannelFilter } from '@/features/clients/types/client.types'

const CHANNEL_OPTIONS = CHANNEL_BRANDS.map((brand) => ({
  value: brand.id.toUpperCase(),
  label: brand.name,
}))

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
        <Select
          id="map-filter-channel"
          label="Canal"
          placeholder="Todos"
          options={CHANNEL_OPTIONS}
          size="sm"
          value={channel}
          onChange={(event) => onChannelChange(event.target.value as ChannelFilter | '')}
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

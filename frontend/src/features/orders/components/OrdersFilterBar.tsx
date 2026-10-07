import { Search } from 'lucide-react'
import { Input, Select } from '@/shared/components'
import { ChannelSelect } from '@/shared/channels/ChannelSelect'
import type { Channel } from '@/shared/types'
import { ORDER_STATUS_LABELS } from '../orderStatus.constants'
import type { OrderStatus } from '../types/order.types'

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

interface OrdersFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  status: OrderStatus | ''
  onStatusChange: (value: OrderStatus | '') => void
  channel: Channel | ''
  onChannelChange: (value: Channel | '') => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  isDateRangeInvalid: boolean
}

export function OrdersFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  channel,
  onChannelChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  isDateRangeInvalid,
}: OrdersFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-60 flex-1">
        <Input
          label="Buscar"
          placeholder="Cliente o producto"
          icon={<Search size={16} aria-hidden="true" />}
          size="sm"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="w-48">
        <Select
          id="orders-filter-status"
          label="Estado"
          placeholder="Todos"
          options={STATUS_OPTIONS}
          size="sm"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as OrderStatus | '')}
        />
      </div>
      <div className="w-48">
        <ChannelSelect
          id="orders-filter-channel"
          size="sm"
          value={channel}
          onChange={(value) => onChannelChange(value as Channel | '')}
        />
      </div>
      <div className="w-44">
        <Input
          label="Desde"
          type="date"
          size="sm"
          max={dateTo || undefined}
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
        />
      </div>
      <div className="w-44">
        <Input
          label="Hasta"
          type="date"
          size="sm"
          min={dateFrom || undefined}
          error={isDateRangeInvalid ? 'Debe ser posterior a la fecha inicial' : undefined}
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
        />
      </div>
    </div>
  )
}

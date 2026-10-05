import { Search } from 'lucide-react'
import { Input, Select } from '@/shared/components'
import { useTags } from '@/features/tags/hooks/useTags'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import type { ChannelFilter } from '../types/client.types'

interface ClientsFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  channel: ChannelFilter | ''
  onChannelChange: (value: ChannelFilter | '') => void
  tagId: string
  onTagIdChange: (value: string) => void
}

export function ClientsFilterBar({
  search,
  onSearchChange,
  channel,
  onChannelChange,
  tagId,
  onTagIdChange,
}: ClientsFilterBarProps) {
  const { data: tags = [] } = useTags()

  const channelOptions = CHANNEL_BRANDS.map((brand) => ({
    value: brand.id.toUpperCase(),
    label: brand.name,
  }))
  const tagOptions = tags.map((tag) => ({ value: tag.id, label: tag.name }))

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-60 flex-1">
        <Input
          label="Buscar"
          placeholder="Nombre, email o teléfono"
          icon={<Search size={16} aria-hidden="true" />}
          size="sm"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="w-48">
        <Select
          id="clients-filter-channel"
          label="Canal"
          placeholder="Todos"
          options={channelOptions}
          size="sm"
          value={channel}
          onChange={(event) => onChannelChange(event.target.value as ChannelFilter | '')}
        />
      </div>
      <div className="w-48">
        <Select
          id="clients-filter-tag"
          label="Etiqueta"
          placeholder="Todas"
          options={tagOptions}
          size="sm"
          value={tagId}
          onChange={(event) => onTagIdChange(event.target.value)}
        />
      </div>
    </div>
  )
}

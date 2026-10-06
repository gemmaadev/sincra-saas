import { Search } from 'lucide-react'
import { Input, Select } from '@/shared/components'
import { useTags } from '@/features/tags/hooks/useTags'
import { ChannelSelect } from '@/shared/channels/ChannelSelect'
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
        <ChannelSelect
          id="clients-filter-channel"
          size="sm"
          value={channel}
          onChange={(value) => onChannelChange(value as ChannelFilter | '')}
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

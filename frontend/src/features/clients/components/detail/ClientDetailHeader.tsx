import { Mail, Phone, Pencil, Trash2 } from 'lucide-react'
import { Avatar, IconButton } from '@/shared/components'
import { ChannelIcons } from '@/shared/channels/ChannelIcons'
import type { ClientDetail } from '../../types/client.types'

interface ClientDetailHeaderProps {
  client: ClientDetail
  onEdit: () => void
  onDelete: () => void
}

export function ClientDetailHeader({ client, onEdit, onDelete }: ClientDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar name={client.name} size="2xl" roundness="rounded" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">{client.name}</span>
            <ChannelIcons channels={client.channels} size={16} />
          </div>
          {client.email && (
            <span className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Mail size={14} aria-hidden="true" />
              {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Phone size={14} aria-hidden="true" />
              {client.phone}
            </span>
          )}
          {!client.email && !client.phone && <span className="text-sm text-ink-muted">—</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <IconButton icon={Pencil} label="Editar cliente" variant="secondary" onClick={onEdit} />
        <IconButton icon={Trash2} label="Eliminar cliente" variant="danger" onClick={onDelete} />
      </div>
    </div>
  )
}

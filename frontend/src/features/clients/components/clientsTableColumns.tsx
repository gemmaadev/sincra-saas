import { Avatar, TagPill } from '@/shared/components'
import { ChannelIcons } from '@/shared/channels/ChannelIcons'
import type { Client } from '../types/client.types'

export const clientsTableColumns = [
  {
    key: 'name',
    header: 'Cliente',
    render: (client: Client) => (
      <div className="flex items-center gap-3">
        <Avatar name={client.name} size="md" />
        <div className="flex flex-col">
          <span className="font-medium text-ink">{client.name}</span>
          <span className="text-sm text-ink-muted">{client.email ?? client.phone ?? '—'}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'channels',
    header: 'Canales',
    render: (client: Client) => <ChannelIcons channels={client.channels} />,
  },
  {
    key: 'tags',
    header: 'Etiquetas',
    render: (client: Client) => (
      <div className="flex flex-wrap items-center gap-2">
        {client.clientTags.length === 0 && <span className="text-sm text-ink-muted">—</span>}
        {client.clientTags.map(({ id, tag }) => (
          <TagPill key={id} name={tag.name} color={tag.color} />
        ))}
      </div>
    ),
  },
  {
    key: 'orders',
    header: 'Pedidos',
    render: () => (
      <span
        className="text-sm text-ink-muted"
        title="Disponible cuando exista el módulo de pedidos"
      >
        —
      </span>
    ),
  },
  {
    key: 'lastActivity',
    header: 'Última actividad',
    render: () => (
      <span
        className="text-sm text-ink-muted"
        title="Entrada automática desde pedidos/comunicaciones"
      >
        —
      </span>
    ),
  },
]

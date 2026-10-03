import { Mail, Phone, Pencil, Trash2 } from 'lucide-react'
import { Avatar, SincraButton } from '@/shared/components'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import type { ClientDetail } from '../types/client.types'

interface ClientDetailHeaderProps {
  client: ClientDetail
}

export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar name={client.name} size="lg" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-ink">{client.name}</span>
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
          <div className="flex items-center gap-2">
            {client.channels.map((channel) => {
              const brand = CHANNEL_BRANDS.find((brand) => brand.id === channel.toLowerCase())

              if (!brand) {
                return (
                  <span key={channel} className="text-xs text-ink-muted" title={channel}>
                    {channel}
                  </span>
                )
              }

              const Icon = brand.icon
              return (
                <Icon
                  key={channel}
                  size={16}
                  className={brand.colorClassName}
                  aria-label={brand.name}
                />
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <SincraButton
          variant="secondary"
          size="icon"
          disabled
          aria-label="Editar cliente"
          title="Disponible próximamente"
        >
          <Pencil size={16} aria-hidden="true" />
        </SincraButton>
        <SincraButton
          variant="danger"
          size="icon"
          disabled
          aria-label="Eliminar cliente"
          title="Disponible próximamente"
        >
          <Trash2 size={16} aria-hidden="true" />
        </SincraButton>
      </div>
    </div>
  )
}

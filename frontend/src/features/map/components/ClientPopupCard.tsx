import { Link } from 'react-router'
import { ArrowRight, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Avatar, SincraButton } from '@/shared/components'
import { ChannelIcons } from '@/shared/channels/ChannelIcons'
import { formatCurrency } from '@/shared/utils'
import type { MapClient } from '../types/map.types'

interface ClientPopupCardProps {
  client: MapClient
  onEdit: () => void
  onDelete: () => void
}

export function ClientPopupCard({ client, onEdit, onDelete }: ClientPopupCardProps) {
  return (
    <div className="flex w-60 flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={client.name} size="lg" />
        <div className="flex min-w-0 flex-col">
          <p className="truncate font-semibold text-ink">{client.name}</p>
          {client.type && <p className="truncate text-sm text-ink-muted">{client.type}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-3 text-sm text-ink-muted">
        <p className="flex items-center gap-2">
          <MapPin size={15} aria-hidden="true" />
          {client.zone ?? 'Sin zona'}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {client.channels.length > 0 && (
            <div className="flex items-center gap-2">
              <span>Canales:</span>
              <ChannelIcons channels={client.channels} size={16} />
            </div>
          )}
          <p>
            {client.orderCount === 0
              ? 'Sin pedidos'
              : `${client.orderCount} ${client.orderCount === 1 ? 'pedido' : 'pedidos'} · ${formatCurrency(Number(client.deliveredRevenue))}`}
          </p>
        </div>
        {client.approximate && (
          <p className="text-xs">Ubicación aproximada: añade su dirección para situarlo mejor.</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center">
          <SincraButton
            variant="text"
            size="icon"
            className="hover:bg-neutral-50"
            onClick={onEdit}
            aria-label="Editar cliente"
            title="Editar cliente"
          >
            <Pencil size={16} aria-hidden="true" />
          </SincraButton>
          <SincraButton
            variant="text"
            size="icon"
            className="hover:bg-neutral-50"
            onClick={onDelete}
            aria-label="Eliminar cliente"
            title="Eliminar cliente"
          >
            <Trash2 size={16} className="text-error" aria-hidden="true" />
          </SincraButton>
        </div>
        <Link
          to={`/clients/${client.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-light px-3 py-1.5 text-sm font-medium text-primary! no-underline hover:bg-surface-hover"
        >
          Ver cliente
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

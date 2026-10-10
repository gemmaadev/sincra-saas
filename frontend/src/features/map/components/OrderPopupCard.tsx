import { MapPin, Pencil } from 'lucide-react'
import { Badge, SincraButton } from '@/shared/components'
import { ChannelIcons } from '@/shared/channels/ChannelIcons'
import { formatCurrency } from '@/shared/utils'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_ICONS,
} from '@/features/orders/orderStatus.constants'
import type { MapOrder } from '../types/map.types'

interface OrderPopupCardProps {
  order: MapOrder
  onEdit: () => void
}

export function OrderPopupCard({ order, onEdit }: OrderPopupCardProps) {
  return (
    <div className="flex w-60 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-ink">Pedido #{order.number}</p>
        <Badge color={ORDER_STATUS_COLORS[order.status]} icon={ORDER_STATUS_ICONS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-3 text-sm text-ink-muted">
        <p className="truncate">{order.clientName}</p>
        <p className="flex items-center gap-2">
          <MapPin size={15} aria-hidden="true" />
          {order.zone ?? 'Sin zona'}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {order.channel && (
            <div className="flex items-center gap-2">
              <span>Canal:</span>
              <ChannelIcons channels={[order.channel]} size={16} />
            </div>
          )}
          <p>{formatCurrency(Number(order.price))}</p>
        </div>
        {order.approximate && (
          <p className="text-xs">Ubicación aproximada: la del cliente, el pedido no tiene dirección propia.</p>
        )}
      </div>

      <div className="flex items-center border-t border-neutral-100 pt-2">
        <SincraButton
          variant="text"
          size="icon"
          className="hover:bg-neutral-50"
          onClick={onEdit}
          aria-label="Editar pedido"
          title="Editar pedido"
        >
          <Pencil size={16} aria-hidden="true" />
        </SincraButton>
      </div>
    </div>
  )
}

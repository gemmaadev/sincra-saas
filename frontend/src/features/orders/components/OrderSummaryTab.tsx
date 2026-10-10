import { Badge } from '@/shared/components'
import { ChannelIcons } from '@/shared/channels/ChannelIcons'
import { formatDate, formatCurrency } from '@/shared/utils'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_ICONS,
} from '../orderStatus.constants'
import { OrderItemsList } from './OrderItemsList'
import type { OrderDetail } from '../types/order.types'

interface OrderSummaryTabProps {
  order: OrderDetail
}

export function OrderSummaryTab({ order }: OrderSummaryTabProps) {
  const location = [order.address, order.zone].filter(Boolean).join(', ')

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {order.description && (
          <div className="flex flex-col gap-1 p-3">
            <span className="text-sm font-semibold text-ink">Descripción del pedido</span>
            <span className="text-sm text-ink-muted">{order.description}</span>
          </div>
        )}
        <div className="grid grid-cols-2  gap-4 p-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Fecha del pedido</span>
            <span className="font-medium text-ink">{formatDate(new Date(order.createdAt))}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Estado</span>
            <Badge
              color={ORDER_STATUS_COLORS[order.status]}
              icon={ORDER_STATUS_ICONS[order.status]}
              className="self-start"
            >
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Canal de origen</span>
            {order.channel ? (
              <ChannelIcons channels={[order.channel]} size={18} />
            ) : (
              <span className="font-medium text-ink">—</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Total</span>
            <span className="font-medium text-ink">{formatCurrency(Number(order.price ?? 0))}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Fecha prevista</span>
            <span className="font-medium text-ink">
              {order.expectedDate ? formatDate(new Date(order.expectedDate)) : '—'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Ubicación</span>
            <span className="font-medium text-ink">{location || '—'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-3">
          <span className="text-sm font-semibold text-ink">Productos</span>
          <OrderItemsList items={order.items} />
        </div>
      </div>
    </div>
  )
}

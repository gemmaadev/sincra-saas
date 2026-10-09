import { Mail, Phone } from 'lucide-react'
import { Avatar, Badge, Card } from '@/shared/components'
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
    <div className="flex flex-col gap-4">
      <Card padding="md" className="flex items-center gap-3">
        <Avatar name={order.client.name} size="lg" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-ink">{order.client.name}</span>
          {order.client.email && (
            <span className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Mail size={14} aria-hidden="true" />
              {order.client.email}
            </span>
          )}
          {order.client.phone && (
            <span className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Phone size={14} aria-hidden="true" />
              {order.client.phone}
            </span>
          )}
          {order.client.channels.length > 0 && (
            <ChannelIcons channels={order.client.channels} size={16} />
          )}
        </div>
      </Card>

      <Card padding="md" className="grid grid-cols-2 gap-4">
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
      </Card>

      {order.description && (
        <Card padding="md" className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-ink">Descripción del pedido</span>
          <span className="text-sm text-ink-muted">{order.description}</span>
        </Card>
      )}

      <Card padding="md" className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-ink">Productos</span>
        <OrderItemsList items={order.items} />
      </Card>
    </div>
  )
}

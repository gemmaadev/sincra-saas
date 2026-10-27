import { Badge } from '@/shared/components'
import { ChannelIcons } from '@/shared/channels/ChannelIcons'
import { formatDate, formatCurrency } from '@/shared/utils'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_ICONS,
} from '@/features/orders/orderStatus.constants'
import type { ClientDetail } from '../../types/client.types'

interface ClientOrdersTabProps {
  client: ClientDetail
}

export function ClientOrdersTab({ client }: ClientOrdersTabProps) {
  if (client.orders.length === 0) {
    return <p className="text-sm text-ink-muted">Todavía no hay pedidos para este cliente.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {client.orders.map((order) => (
        <li
          key={order.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink">#{order.number}</span>

              <span className="text-xs text-ink-muted">
                {formatDate(new Date(order.createdAt))}
              </span>
            </div>
            {order.description && <span className="text-sm text-ink">{order.description}</span>}
          </div>
          <div className="flex items-center gap-3">
            {order.channel && <ChannelIcons channels={[order.channel]} />}
            <Badge
              color={ORDER_STATUS_COLORS[order.status]}
              icon={ORDER_STATUS_ICONS[order.status]}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
            <span className="font-medium text-ink">
              {order.price !== null ? formatCurrency(Number(order.price)) : '—'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

import { Badge } from '@/shared/components'
import { ChannelIcons } from '@/shared/channels/ChannelIcons'
import { formatDate, formatCurrency } from '@/shared/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/shared/utils'
import type { Order } from '../types/order.types'

export const ordersTableColumns = [
  {
    key: 'number',
    header: 'Pedido',
    render: (order: Order) => <span className="font-medium text-ink">#{order.number}</span>,
  },
  {
    key: 'client',
    header: 'Cliente',
    render: (order: Order) => <span className="text-ink">{order.client.name}</span>,
  },
  {
    key: 'product',
    header: 'Producto / Servicio',
    render: (order: Order) => {
      const item = order.items[0]

      if (!item) {
        return <span className="text-sm text-ink-muted">—</span>
      }

      return (
        <div className="flex flex-col">
          <span className="text-ink">{item.product}</span>
          {item.description && (
            <span className="text-sm text-ink-muted">{item.description}</span>
          )}
        </div>
      )
    },
  },
  {
    key: 'status',
    header: 'Estado',
    render: (order: Order) => (
      <Badge color={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
    ),
  },
  {
    key: 'channel',
    header: 'Canal',
    render: (order: Order) =>
      order.channel ? (
        <ChannelIcons channels={[order.channel]} />
      ) : (
        <span className="text-sm text-ink-muted">—</span>
      ),
  },
  {
    key: 'createdAt',
    header: 'Fecha',
    render: (order: Order) => (
      <span className="text-sm text-ink">{formatDate(new Date(order.createdAt))}</span>
    ),
  },
  {
    key: 'price',
    header: 'Total',
    render: (order: Order) => (
      <span className="font-medium text-ink">
        {order.price !== null ? formatCurrency(Number(order.price)) : '—'}
      </span>
    ),
  },
]

import { Badge } from '@/shared/components'
import { ChannelIcons } from '@/shared/channels/ChannelIcons'
import { formatDate, formatCurrency } from '@/shared/utils'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_ICONS,
} from '../orderStatus.constants'
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
    render: (order: Order) =>
      order.description ? (
        <span className="text-ink">{order.description}</span>
      ) : (
        <span className="text-sm text-ink-muted">—</span>
      ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (order: Order) => (
      <Badge color={ORDER_STATUS_COLORS[order.status]} icon={ORDER_STATUS_ICONS[order.status]}>
        {ORDER_STATUS_LABELS[order.status]}
      </Badge>
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

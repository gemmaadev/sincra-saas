import { Card, Badge, InfoTooltip } from '@/shared/components'
import { formatDate, formatCurrency } from '@/shared/utils'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_ICONS,
} from '@/features/orders/orderStatus.constants'
import type { ClientDetail } from '../types/client.types'

const RECENT_ORDERS_LIMIT = 3

interface SummaryTabProps {
  client: ClientDetail
}

export function SummaryTab({ client }: SummaryTabProps) {
  const location = [client.address, client.zone].filter(Boolean).join(', ')
  // Only delivered orders are guaranteed revenue — a pending/shipped order could still
  // be cancelled before it completes, and a cancelled one was never actually paid.
  const totalValue = client.orders
    .filter((order) => order.status === 'DELIVERED')
    .reduce((sum, order) => sum + Number(order.price ?? 0), 0)
  const recentOrders = client.orders.slice(0, RECENT_ORDERS_LIMIT)

  return (
    <div className="flex flex-col gap-4">
      <Card padding="md" className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-muted">Cliente desde</span>
          <span className="font-medium text-ink">{formatDate(new Date(client.createdAt))}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-muted">Ubicación</span>
          <span className="font-medium text-ink">{location || '—'}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-muted">Total de pedidos</span>
          <span className="font-medium text-ink">{client.orders.length}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-sm text-ink-muted">Valor total</span>
            <InfoTooltip label="Solo pedidos entregados" />
          </div>
          <span className="font-medium text-ink">{formatCurrency(totalValue)}</span>
        </div>
      </Card>

      <Card padding="md" className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Pedidos recientes</span>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-ink-muted">Todavía no hay pedidos para este cliente.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-ink">#{order.number}</span>
                <Badge
                  color={ORDER_STATUS_COLORS[order.status]}
                  icon={ORDER_STATUS_ICONS[order.status]}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <span className="text-sm text-ink-muted">
                  {formatDate(new Date(order.createdAt))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padding="md" className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Últimas conversaciones</span>
        <p className="text-sm text-ink-muted">Esta función no está disponible todavía</p>
      </Card>
    </div>
  )
}

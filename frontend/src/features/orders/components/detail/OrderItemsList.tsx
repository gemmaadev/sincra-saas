import { Card } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { OrderItem } from '../types/order.types'

interface OrderItemsListProps {
  items: OrderItem[]
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">Este pedido no tiene productos.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <Card padding="sm" className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-ink">{item.product}</span>
              {item.description && (
                <span className="text-sm text-ink-muted">{item.description}</span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm text-ink-muted">
              <span>{formatCurrency(Number(item.unitPrice))}</span>
              <span>x{item.quantity}</span>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}

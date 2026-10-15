import { ORDER_STATUS_LABELS } from '@/features/orders/orderStatus.constants'
import type { OrderStatus } from '@/features/orders/types/order.types'
import type { OrdersByStatus } from '../types/stats.types'
import type { StatsDonutSlice } from '../components/StatsDonutChart'

// Hex, not design tokens: ECharts' canvas can't resolve CSS vars.
const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#94a3b8',
  PREPARING: '#d99a34',
  SHIPPED: '#1e5eff',
  DELIVERED: '#3fa65c',
  CANCELLED: '#e5484d',
}

export function buildOrderStatusSlices(ordersByStatus: OrdersByStatus): StatsDonutSlice[] {
  return ordersByStatus.statuses
    .filter((entry) => entry.count > 0)
    .map((entry) => ({
      label: ORDER_STATUS_LABELS[entry.status],
      value: entry.count,
      percentage: entry.percentage,
      color: ORDER_STATUS_COLORS[entry.status],
    }))
}

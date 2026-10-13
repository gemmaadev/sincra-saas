import { Prisma, type OrderStatus } from '../../generated/prisma/client'
import {
  countClientsCreatedInRange,
  countOrdersByStatusInRange,
  countOrdersCreatedInRange,
  findDeliveredOrdersInRange,
} from './stats.model'
import type { OrdersByStatus, StatsDashboard, StatsFilters, StatsOverview } from './stats.types'

const ALL_ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

interface DeliveredOrderRecord {
  id: string
  price: Prisma.Decimal | null
  createdAt: Date
  statusHistory: { changedAt: Date }[]
}

function buildCreatedAtRange(
  dateFrom?: string,
  dateTo?: string,
): Prisma.DateTimeFilter | undefined {
  const range: Prisma.DateTimeFilter = {}

  if (dateFrom) {
    const gte = new Date(dateFrom)
    if (!Number.isNaN(gte.getTime())) range.gte = gte
  }

  if (dateTo) {
    const lte = new Date(dateTo)
    if (!Number.isNaN(lte.getTime())) range.lte = lte
  }

  return Object.keys(range).length > 0 ? range : undefined
}

// Average days from creation to last DELIVERED; orders missing that entry are excluded, not zeroed.
function computeAverageDeliveryDays(orders: DeliveredOrderRecord[]): number | null {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const deliveredOrders = orders.filter((order) => order.statusHistory[0])

  if (deliveredOrders.length === 0) return null

  const totalDays = deliveredOrders.reduce((sum, order) => {
    const deliveredAt = order.statusHistory[0]!.changedAt
    return sum + (deliveredAt.getTime() - order.createdAt.getTime()) / MS_PER_DAY
  }, 0)

  return Math.round((totalDays / deliveredOrders.length) * 10) / 10
}

function sumRevenue(orders: DeliveredOrderRecord[]): Prisma.Decimal {
  return orders.reduce((total, order) => total.plus(order.price ?? 0), new Prisma.Decimal(0))
}

export async function getOverview(
  businessId: string,
  filters: StatsFilters,
): Promise<StatsOverview> {
  const createdAtRange = buildCreatedAtRange(filters.dateFrom, filters.dateTo)

  const [newClients, ordersCreated, deliveredOrders] = await Promise.all([
    countClientsCreatedInRange(businessId, createdAtRange),
    countOrdersCreatedInRange(businessId, createdAtRange),
    findDeliveredOrdersInRange(businessId, createdAtRange),
  ])

  return {
    newClients,
    ordersCreated,
    averageDeliveryDays: computeAverageDeliveryDays(deliveredOrders),
    revenue: sumRevenue(deliveredOrders).toString(),
  }
}

function toPercentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

// Always returns all 5 statuses, in the order they occur in the order lifecycle, zero-count ones included.
function buildOrdersByStatus(groups: { status: OrderStatus; _count: number }[]): OrdersByStatus {
  const counts = Object.fromEntries(
    ALL_ORDER_STATUSES.map((status) => [status, 0]),
  ) as Record<OrderStatus, number>

  for (const group of groups) {
    counts[group.status] = group._count
  }

  const total = ALL_ORDER_STATUSES.reduce((sum, status) => sum + counts[status], 0)

  return {
    total,
    statuses: ALL_ORDER_STATUSES.map((status) => ({
      status,
      count: counts[status],
      percentage: toPercentage(counts[status], total),
    })),
  }
}

export async function getOrdersByStatus(
  businessId: string,
  filters: StatsFilters,
): Promise<OrdersByStatus> {
  const createdAtRange = buildCreatedAtRange(filters.dateFrom, filters.dateTo)
  const groups = await countOrdersByStatusInRange(businessId, createdAtRange)

  return buildOrdersByStatus(groups)
}

// Every widget on the stats dashboard shares the same date-range filter and is always
// requested together, so they're served from one endpoint (same pattern as GET /clients/map
// and GET /orders/map) instead of one round trip per chart.
export async function getDashboard(businessId: string, filters: StatsFilters): Promise<StatsDashboard> {
  const [overview, ordersByStatus] = await Promise.all([
    getOverview(businessId, filters),
    getOrdersByStatus(businessId, filters),
  ])

  return { overview, ordersByStatus }
}

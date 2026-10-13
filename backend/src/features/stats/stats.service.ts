import { Prisma } from '../../generated/prisma/client'
import {
  countClientsCreatedInRange,
  countOrdersCreatedInRange,
  findDeliveredOrdersInRange,
} from './stats.model'
import type { StatsFilters, StatsOverview } from './stats.types'

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

// Average days between an order's creation and the last time it was marked DELIVERED.
// An order with no DELIVERED entry in its history (shouldn't happen for a DELIVERED order,
// but the join is left as a safety net) is excluded rather than treated as zero days.
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

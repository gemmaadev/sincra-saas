import { Prisma, type OrderStatus } from '../../generated/prisma/client'
import {
  countAiGeneratedClientsInRange,
  countAiGeneratedOrdersInRange,
  countClientsByTypeInRange,
  countClientsCreatedInRange,
  countOrdersByStatusInRange,
  countOrdersCreatedInRange,
  findDeliveredOrdersInRange,
  findOrderCreatedDatesInRange,
} from './stats.model'
import type {
  AiSummary,
  ClientsByType,
  OrdersByStatus,
  OrdersEvolution,
  OrdersEvolutionGranularity,
  StatsDashboard,
  StatsFilters,
  StatsOverview,
} from './stats.types'

const UNSET_CLIENT_TYPE_LABEL = 'Sin segmento'

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

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
  const counts = Object.fromEntries(ALL_ORDER_STATUSES.map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >

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

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Monday start using local date components to prevent DST shift bugs (matches frontend logic).
function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = start.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diffToMonday)
  return start
}

function bucketStart(date: Date, granularity: OrdersEvolutionGranularity): Date {
  return granularity === 'weekly'
    ? startOfWeek(date)
    : new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Generates every date/week in range for a continuous chart timeline (filling empty days with 0).
function buildBucketKeys(
  dateFrom: Date,
  dateTo: Date,
  granularity: OrdersEvolutionGranularity,
): string[] {
  const step = granularity === 'weekly' ? 7 : 1
  const end = bucketStart(dateTo, granularity)
  const keys: string[] = []

  let cursor = bucketStart(dateFrom, granularity)
  while (cursor.getTime() <= end.getTime()) {
    keys.push(toDateKey(cursor))
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + step)
  }

  return keys
}

export async function getOrdersEvolution(
  businessId: string,
  filters: StatsFilters,
): Promise<OrdersEvolution> {
  const granularity = filters.granularity ?? 'daily'
  const createdAtRange = buildCreatedAtRange(filters.dateFrom, filters.dateTo)
  const orders = await findOrderCreatedDatesInRange(businessId, createdAtRange)

  const counts = new Map<string, number>()
  for (const order of orders) {
    const key = toDateKey(bucketStart(order.createdAt, granularity))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  // If date range is incomplete, only plot buckets with actual data.
  const bucketKeys =
    createdAtRange?.gte && createdAtRange.lte
      ? buildBucketKeys(createdAtRange.gte as Date, createdAtRange.lte as Date, granularity)
      : [...counts.keys()].sort()

  return {
    granularity,
    points: bucketKeys.map((date) => ({ date, count: counts.get(date) ?? 0 })),
  }
}

// Groups null/empty/whitespace-only type into a single "Sin segmento" bucket, sorted by count desc 
function buildClientsByType(groups: { type: string | null; _count: number }[]): ClientsByType {
  const counts = new Map<string, number>()

  for (const group of groups) {
    const label = group.type?.trim() || UNSET_CLIENT_TYPE_LABEL
    counts.set(label, (counts.get(label) ?? 0) + group._count)
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0)

  const types = [...counts.entries()]
    .map(([type, count]) => ({ type, count, percentage: toPercentage(count, total) }))
    .sort((first, second) => second.count - first.count || first.type.localeCompare(second.type))

  return { total, types }
}

export async function getClientsByType(
  businessId: string,
  filters: StatsFilters,
): Promise<ClientsByType> {
  const createdAtRange = buildCreatedAtRange(filters.dateFrom, filters.dateTo)
  const groups = await countClientsByTypeInRange(businessId, createdAtRange)

  return buildClientsByType(groups)
}

export async function getAiSummary(businessId: string, filters: StatsFilters): Promise<AiSummary> {
  const createdAtRange = buildCreatedAtRange(filters.dateFrom, filters.dateTo)

  const [clientsDetected, ordersDetected] = await Promise.all([
    countAiGeneratedClientsInRange(businessId, createdAtRange),
    countAiGeneratedOrdersInRange(businessId, createdAtRange),
  ])

  return { clientsDetected, ordersDetected }
}

// Single endpoint to avoid multiple round-trips for each dashboard chart.
export async function getDashboard(
  businessId: string,
  filters: StatsFilters,
): Promise<StatsDashboard> {
  const [overview, ordersByStatus, ordersEvolution, clientsByType, aiSummary] = await Promise.all([
    getOverview(businessId, filters),
    getOrdersByStatus(businessId, filters),
    getOrdersEvolution(businessId, filters),
    getClientsByType(businessId, filters),
    getAiSummary(businessId, filters),
  ])

  return { overview, ordersByStatus, ordersEvolution, clientsByType, aiSummary }
}

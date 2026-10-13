import type { OrderStatus } from '../../generated/prisma/client'

export interface StatsFilters {
  dateFrom?: string
  dateTo?: string
}

export interface StatsOverview {
  newClients: number
  ordersCreated: number
  averageDeliveryDays: number | null
  revenue: string
}

export interface OrderStatusCount {
  status: OrderStatus
  count: number
  percentage: number
}

export interface OrdersByStatus {
  total: number
  statuses: OrderStatusCount[]
}

export interface StatsDashboard {
  overview: StatsOverview
  ordersByStatus: OrdersByStatus
}

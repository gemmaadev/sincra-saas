import type { OrderStatus } from '../../generated/prisma/client'

export type OrdersEvolutionGranularity = 'daily' | 'weekly'

export interface StatsFilters {
  dateFrom?: string
  dateTo?: string
  // Only used by getOrdersEvolution; ignored by every other aggregation.
  granularity?: OrdersEvolutionGranularity
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

export interface OrdersEvolutionPoint {
  date: string
  count: number
}

export interface OrdersEvolution {
  granularity: OrdersEvolutionGranularity
  points: OrdersEvolutionPoint[]
}

export interface ClientTypeCount {
  type: string
  count: number
  percentage: number
}

// TODO: replace with Client.stage once that field is actually assignable somewhere in the app
export interface ClientsByType {
  total: number
  types: ClientTypeCount[]
}

export interface AiSummary {
  clientsDetected: number
  ordersDetected: number
}

export interface StatsDashboard {
  overview: StatsOverview
  ordersByStatus: OrdersByStatus
  ordersEvolution: OrdersEvolution
  clientsByType: ClientsByType
  aiSummary: AiSummary
}

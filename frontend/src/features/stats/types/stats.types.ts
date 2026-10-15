import type { OrderStatus } from '@/features/orders/types/order.types'
import type { Channel } from '@/shared/types'

export type OrdersEvolutionGranularity = 'daily' | 'weekly'

export interface StatsFilters {
  dateFrom?: string
  dateTo?: string
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

export interface ClientsByType {
  total: number
  types: ClientTypeCount[]
}

export interface AiSummary {
  clientsDetected: number
  ordersDetected: number
}

export interface ChannelPerformanceEntry {
  channel: Channel | null
  orderCount: number
  revenue: string
  averageTicket: string
}

export interface ChannelPerformance {
  entries: ChannelPerformanceEntry[]
}

export interface StatsDashboard {
  overview: StatsOverview
  ordersByStatus: OrdersByStatus
  ordersEvolution: OrdersEvolution
  clientsByType: ClientsByType
  aiSummary: AiSummary
  channelPerformance: ChannelPerformance
}

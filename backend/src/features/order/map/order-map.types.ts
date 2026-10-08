import type { Channel, OrderStatus, Prisma } from '../../../generated/prisma/client'

export interface OrderMapFilters {
  channel?: Channel
  from?: Date
  to?: Date
}

export interface OrderMapQuery {
  channel?: unknown
  from?: unknown
  to?: unknown
}

export interface OrderMapRecord {
  id: string
  status: OrderStatus
  price: Prisma.Decimal | null
  zone: string | null
  client: { zone: string | null }
}

export interface OrderMapZoneSummary {
  zone: string
  count: number
  revenue: string
  percentage: number
}

export interface OrderMapResponse {
  total: number
  deliveredRevenue: string
  zones: OrderMapZoneSummary[]
}

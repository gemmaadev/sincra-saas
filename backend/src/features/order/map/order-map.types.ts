import type { Channel } from '../../../generated/prisma/client'

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
  zone: string | null
  client: { zone: string | null }
}

export interface OrderMapZoneSummary {
  zone: string
  count: number
  percentage: number
}

export interface OrderMapResponse {
  total: number
  zones: OrderMapZoneSummary[]
  ordersWithoutZone: number
}

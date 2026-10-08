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
  number: number
  status: OrderStatus
  channel: Channel | null
  price: Prisma.Decimal | null
  zone: string | null
  latitude: number | null
  longitude: number | null
  client: { name: string; zone: string | null; latitude: number | null; longitude: number | null }
}

export interface OrderMapZoneSummary {
  zone: string
  count: number
  revenue: string
  percentage: number
}

export interface MapOrder {
  id: string
  number: number
  status: OrderStatus
  channel: Channel | null
  price: string
  zone: string | null
  clientName: string
  latitude: number
  longitude: number
  // true when the order has no coordinates of its own and is shown at the client's location instead
  approximate: boolean
}

export interface OrderMapResponse {
  total: number
  deliveredRevenue: string
  zones: OrderMapZoneSummary[]
  orders: MapOrder[]
}

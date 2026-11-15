import type { Channel } from '@/shared/types'
import type { OrderStatus } from '@/features/orders/types/order.types'

export type MapLayer = 'clients' | 'orders'

export interface MapFilters {
  channel?: Channel
  type?: string
  from?: string
  to?: string
}

export interface MapClient {
  id: string
  name: string
  latitude: number
  longitude: number
  zone: string | null
  channels: Channel[]
  type: string | null
  approximate: boolean
  orderCount: number
  deliveredRevenue: string
  hasPriceData?: boolean
  pricedCount?: number
  missingPriceCount?: number
}

export interface ZoneSummary {
  zone: string
  count: number
  percentage: number
}

export interface ChannelShare {
  channel: Channel
  count: number
  percentage: number
}

export interface ClientMapResponse {
  total: number
  clients: MapClient[]
  zones: ZoneSummary[]
  channelOrigin: ChannelShare[]
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
  price: string | null
  zone: string | null
  clientName: string
  latitude: number
  longitude: number
  approximate: boolean
}

export interface OrderMapResponse {
  total: number
  deliveredRevenue: string
  hasPriceData?: boolean
  pricedCount?: number
  missingPriceCount?: number
  zones: OrderMapZoneSummary[]
  orders: MapOrder[]
}

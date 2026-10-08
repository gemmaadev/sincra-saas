import type { Channel } from '@/shared/types'

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

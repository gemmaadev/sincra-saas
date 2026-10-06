import type { ChannelFilter } from '@/features/clients/types/client.types'

export interface MapFilters {
  channel?: ChannelFilter
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
  channels: ChannelFilter[]
  type: string | null
  approximate: boolean
}

export interface ZoneSummary {
  zone: string
  count: number
  percentage: number
}

export interface ChannelShare {
  channel: ChannelFilter
  count: number
  percentage: number
}

export interface ClientMapResponse {
  total: number
  clients: MapClient[]
  zones: ZoneSummary[]
  channelOrigin: ChannelShare[]
}

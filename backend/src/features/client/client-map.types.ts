import type { Channel } from '../../generated/prisma/client'

export interface ClientMapFilters {
  channel?: Channel
  type?: string
  from?: Date
  to?: Date
}

export interface ClientMapRecord {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
  zone: string | null
  channels: Channel[]
  type: string | null
}

export interface Coordinates {
  latitude: number
  longitude: number
}

export type ZonePoint = Pick<ClientMapRecord, 'zone' | 'latitude' | 'longitude'>

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

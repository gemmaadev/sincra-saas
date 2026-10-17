import type { Channel } from '@/shared/types'

export interface BusinessSettings {
  id: string
  name: string
  sector: string | null
  description: string | null
  country: string
  phone: string | null
  address: string | null
  schedule: string | null
  nif: string | null
  email: string | null
  timezone: string
  language: string
}

export interface UpdateBusinessSettingsInput {
  name?: string
  sector?: string | null
  nif?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  schedule?: string | null
  timezone?: string
  language?: string
}

export type ChannelConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'MOCKED'

export interface ConnectedChannelStatus {
  channel: Channel
  status: ChannelConnectionStatus
}

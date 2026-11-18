import type { Channel, ChannelConnectionStatus } from '../../generated/prisma/client'

export interface ChannelActionBody {
  channel: Channel
  accessToken?: string
  accountEmail?: string
}

export interface ConnectedChannelStatus {
  channel: Channel
  status: ChannelConnectionStatus | 'MOCKED'
  accountEmail: string | null
}

export interface UpdateBusinessSettingsBody {
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

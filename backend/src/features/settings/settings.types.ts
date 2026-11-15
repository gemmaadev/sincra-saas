import type { Channel } from '../../generated/prisma/client'

export interface ChannelActionBody {
  channel: Channel
  accessToken?: string
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

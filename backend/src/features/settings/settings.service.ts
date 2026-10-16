import type { Channel } from '../../generated/prisma/client'
import { upsertConnectedChannel } from './settings.model'

export async function connectChannel(businessId: string, channel: Channel, userId: string) {
  return upsertConnectedChannel(businessId, channel, 'CONNECTED', userId)
}

export async function disconnectChannel(businessId: string, channel: Channel, userId: string) {
  return upsertConnectedChannel(businessId, channel, 'DISCONNECTED', userId)
}

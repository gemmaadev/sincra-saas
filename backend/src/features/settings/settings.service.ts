import type { Channel } from '../../generated/prisma/client'
import { AppError } from '../../shared/AppError'
import { findBusinessById, updateBusiness } from '../auth/auth.model'
import { findConnectedChannels, upsertConnectedChannel } from './settings.model'
import type { UpdateBusinessSettingsBody } from './settings.types'

export async function connectChannel(businessId: string, channel: Channel, userId: string) {
  return upsertConnectedChannel(businessId, channel, 'CONNECTED', userId)
}

export async function disconnectChannel(businessId: string, channel: Channel, userId: string) {
  return upsertConnectedChannel(businessId, channel, 'DISCONNECTED', userId)
}

export async function getBusinessSettings(businessId: string) {
  const business = await findBusinessById(businessId)

  if (!business) {
    throw new AppError('Negocio no encontrado', 404, 'BUSINESS_NOT_FOUND')
  }

  return business
}

export async function updateBusinessSettings(
  businessId: string,
  data: UpdateBusinessSettingsBody,
  userId: string,
) {
  return updateBusiness(businessId, { ...data, updatedBy: userId })
}

// No real integration yet — always MOCKED
const MOCKED_CHANNELS: Channel[] = ['WHATSAPP', 'INSTAGRAM', 'MESSENGER']
const ALL_CHANNELS: Channel[] = ['GMAIL', 'OUTLOOK', 'WHATSAPP', 'INSTAGRAM', 'MESSENGER']

export async function getConnectedChannelsStatus(businessId: string) {
  const connectedChannels = await findConnectedChannels(businessId)
  const statusByChannel = new Map(connectedChannels.map((row) => [row.channel, row.status]))

  return ALL_CHANNELS.map((channel) => ({
    channel,
    status: MOCKED_CHANNELS.includes(channel)
      ? ('MOCKED' as const)
      : (statusByChannel.get(channel) ?? ('DISCONNECTED' as const)),
  }))
}

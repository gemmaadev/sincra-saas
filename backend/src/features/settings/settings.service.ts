import type { Channel } from '../../generated/prisma/client'
import { AppError } from '../../shared/AppError'
import { findBusinessById, updateBusiness } from '../auth/auth.model'
import { verifyGmailAccessToken } from './gmail-token'
import { findConnectedChannels, upsertConnectedChannel } from './settings.model'
import type { ConnectedChannelStatus, UpdateBusinessSettingsBody } from './settings.types'

const ACCOUNT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function requireAccountEmail(email: unknown) {
  if (typeof email !== 'string' || !email.trim()) {
    throw new AppError('Falta el email de la cuenta', 400, 'ACCOUNT_EMAIL_REQUIRED')
  }

  const accountEmail = email.trim().toLowerCase()
  if (!ACCOUNT_EMAIL_PATTERN.test(accountEmail)) {
    throw new AppError('El email no tiene un formato válido', 400, 'INVALID_ACCOUNT_EMAIL')
  }

  return accountEmail
}

export async function connectChannel(
  businessId: string,
  channel: Channel,
  userId: string,
  input: { accessToken?: string; accountEmail?: string } = {},
) {
  if (channel === 'GMAIL') {
    if (!input.accessToken?.trim()) {
      throw new AppError('Falta el token de Gmail', 400, 'GMAIL_TOKEN_REQUIRED')
    }

    const account = await verifyGmailAccessToken(input.accessToken)
    return upsertConnectedChannel(businessId, channel, 'CONNECTED', userId, {
      accountEmail: account.email,
      providerAccountId: account.sub,
    })
  }

  return upsertConnectedChannel(businessId, channel, 'CONNECTED', userId, {
    accountEmail: requireAccountEmail(input.accountEmail),
  })
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

export async function deleteAccount(businessId: string, userId: string) {
  await updateBusiness(businessId, { deletedAt: new Date(), updatedBy: userId })
}

// No real integration yet — always MOCKED
const MOCKED_CHANNELS: Channel[] = ['WHATSAPP', 'INSTAGRAM', 'MESSENGER']
const ALL_CHANNELS: Channel[] = ['GMAIL', 'OUTLOOK', 'WHATSAPP', 'INSTAGRAM', 'MESSENGER']

function normalizeAccountEmail(email: string | null | undefined) {
  if (typeof email !== 'string') return null
  const normalized = email.trim().toLowerCase()
  return normalized || null
}

export async function getConnectedChannelsStatus(
  businessId: string,
): Promise<ConnectedChannelStatus[]> {
  const connectedChannels = await findConnectedChannels(businessId)
  const rowByChannel = new Map(connectedChannels.map((row) => [row.channel, row]))

  return ALL_CHANNELS.map((channel) => {
    const row = rowByChannel.get(channel)
    const status = MOCKED_CHANNELS.includes(channel)
      ? ('MOCKED' as const)
      : (row?.status ?? ('DISCONNECTED' as const))

    // A disconnected row can still store the previous address. Only a real
    // connection should tell the business which account is in use.
    return {
      channel,
      status,
      accountEmail: status === 'CONNECTED' ? normalizeAccountEmail(row?.accountEmail) : null,
    }
  })
}

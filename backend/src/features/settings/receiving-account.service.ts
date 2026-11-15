import type { Channel } from '../../generated/prisma/client'
import { normalizeAccountEmail, normalizeProviderAccountId } from './channel-account'
import { findConnectedChannelsByAccount } from './settings.model'

export interface ReceivingAccount {
  channel: Channel
  email?: string | null
  providerAccountId?: string | null
}

// The same inbox can be connected to several businesses. Each id is returned once so the
// caller can process that email separately, isolated by businessId. No match means save nothing.
export async function resolveBusinessesByReceivingAccount(
  account: ReceivingAccount,
): Promise<string[]> {
  const accountEmail = normalizeAccountEmail(account.email)
  const providerAccountId = normalizeProviderAccountId(account.providerAccountId)

  if (!providerAccountId && !accountEmail) return []

  const channels = await findConnectedChannelsByAccount({
    channel: account.channel,
    accountEmail,
    providerAccountId,
  })
  const businessIds: string[] = []

  for (const channel of channels) {
    if (!businessIds.includes(channel.businessId)) businessIds.push(channel.businessId)
  }

  return businessIds
}

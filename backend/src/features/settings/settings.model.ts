import prisma from '../../config/db'
import type { Channel, ChannelConnectionStatus } from '../../generated/prisma/client'

export interface ConnectedChannelAccount {
  accountEmail: string
  providerAccountId: string
}

export async function findConnectedChannels(businessId: string) {
  return prisma.connectedChannel.findMany({ where: { businessId } })
}

export async function findConnectedChannelsByAccount(account: {
  accountEmail: string | null
  providerAccountId: string | null
}) {
  const matches = [
    ...(account.accountEmail ? [{ accountEmail: account.accountEmail }] : []),
    ...(account.providerAccountId ? [{ providerAccountId: account.providerAccountId }] : []),
  ]

  if (matches.length === 0) return []

  return prisma.connectedChannel.findMany({
    where: { status: 'CONNECTED', OR: matches },
    select: { businessId: true },
  })
}

export async function upsertConnectedChannel(
  businessId: string,
  channel: Channel,
  status: ChannelConnectionStatus,
  userId: string,
  account?: ConnectedChannelAccount,
) {
  return prisma.connectedChannel.upsert({
    where: { businessId_channel: { businessId, channel } },
    create: {
      businessId,
      channel,
      status,
      createdBy: userId,
      updatedBy: userId,
      ...account,
    },
    update: { status, updatedBy: userId, ...account },
  })
}

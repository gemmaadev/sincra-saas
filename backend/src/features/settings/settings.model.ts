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
  channel: Channel
  accountEmail: string | null
  providerAccountId: string | null
}) {
  // Provider id wins. The email is only a fallback, so a Gmail message never
  // matches another channel that happens to store the same address.
  if (account.providerAccountId) {
    return prisma.connectedChannel.findMany({
      where: {
        channel: account.channel,
        status: 'CONNECTED',
        providerAccountId: account.providerAccountId,
      },
      select: { businessId: true },
    })
  }

  if (!account.accountEmail) return []

  return prisma.connectedChannel.findMany({
    where: {
      channel: account.channel,
      status: 'CONNECTED',
      accountEmail: account.accountEmail,
    },
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

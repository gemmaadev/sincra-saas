import prisma from '../../config/db'
import type { Channel, ChannelConnectionStatus } from '../../generated/prisma/client'

export async function findConnectedChannels(businessId: string) {
  return prisma.connectedChannel.findMany({ where: { businessId } })
}

export async function upsertConnectedChannel(
  businessId: string,
  channel: Channel,
  status: ChannelConnectionStatus,
  userId: string,
  account?: { accountEmail: string; providerAccountId: string },
) {
  return prisma.connectedChannel.upsert({
    where: { businessId_channel: { businessId, channel } },
    create: {
      businessId,
      channel,
      status,
      createdBy: userId,
      updatedBy: userId,
      accountEmail: account?.accountEmail,
      providerAccountId: account?.providerAccountId,
    },
    update: { status, updatedBy: userId, ...account },
  })
}

// Businesses whose CONNECTED account matches this channel.
// providerAccountId wins; email is used only when the provider id is absent.
export async function findBusinessIdsByConnectedAccount(
  channel: Channel,
  account: { providerAccountId?: string | null; accountEmail?: string | null },
) {
  const providerAccountId = account.providerAccountId?.trim() || null
  const accountEmail = account.accountEmail?.trim() || null
  if (!providerAccountId && !accountEmail) return []

  const rows = await prisma.connectedChannel.findMany({
    where: {
      channel,
      status: 'CONNECTED',
      ...(providerAccountId ? { providerAccountId } : { accountEmail }),
    },
    select: { businessId: true },
  })

  return rows.map((row) => row.businessId)
}

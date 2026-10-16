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
) {
  return prisma.connectedChannel.upsert({
    where: { businessId_channel: { businessId, channel } },
    create: { businessId, channel, status, createdBy: userId, updatedBy: userId },
    update: { status, updatedBy: userId },
  })
}

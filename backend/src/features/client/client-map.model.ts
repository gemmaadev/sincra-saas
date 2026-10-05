import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'
import type { ClientMapFilters } from './client-map.types'

function buildMapWhere(businessId: string, filters: ClientMapFilters): Prisma.ClientWhereInput {
  const { channel, type, from, to } = filters

  return {
    businessId,
    ...(channel && { channels: { has: channel } }),
    ...(type && { type }),
    ...((from || to) && {
      createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) },
    }),
  }
}

export async function findClientsForMap(businessId: string, filters: ClientMapFilters) {
  return prisma.client.findMany({
    where: buildMapWhere(businessId, filters),
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      zone: true,
      channels: true,
      type: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findZoneCoordinates(businessId: string) {
  return prisma.client.findMany({
    where: {
      businessId,
      zone: { not: null },
      latitude: { not: null },
      longitude: { not: null },
    },
    select: { zone: true, latitude: true, longitude: true },
  })
}

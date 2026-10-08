import prisma from '../../../config/db'
import type { Prisma } from '../../../generated/prisma/client'
import type { OrderMapFilters } from './order-map.types'

function buildMapWhere(businessId: string, filters: OrderMapFilters): Prisma.OrderWhereInput {
  const { channel, from, to } = filters

  return {
    businessId,
    ...(channel && { channel }),
    ...((from || to) && {
      createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) },
    }),
  }
}

export async function findOrdersForMap(businessId: string, filters: OrderMapFilters) {
  return prisma.order.findMany({
    where: buildMapWhere(businessId, filters),
    select: {
      id: true,
      status: true,
      price: true,
      zone: true,
      client: { select: { zone: true } },
    },
  })
}

import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'

export async function countClientsCreatedInRange(
  businessId: string,
  createdAtRange?: Prisma.DateTimeFilter,
) {
  return prisma.client.count({
    where: { businessId, ...(createdAtRange && { createdAt: createdAtRange }) },
  })
}

export async function countOrdersCreatedInRange(
  businessId: string,
  createdAtRange?: Prisma.DateTimeFilter,
) {
  return prisma.order.count({
    where: { businessId, ...(createdAtRange && { createdAt: createdAtRange }) },
  })
}

export async function countOrdersByStatusInRange(
  businessId: string,
  createdAtRange?: Prisma.DateTimeFilter,
) {
  return prisma.order.groupBy({
    by: ['status'],
    where: { businessId, ...(createdAtRange && { createdAt: createdAtRange }) },
    _count: true,
  })
}

export async function findOrderCreatedDatesInRange(
  businessId: string,
  createdAtRange?: Prisma.DateTimeFilter,
) {
  return prisma.order.findMany({
    where: { businessId, ...(createdAtRange && { createdAt: createdAtRange }) },
    select: { createdAt: true },
  })
}

export async function findDeliveredOrdersInRange(
  businessId: string,
  createdAtRange?: Prisma.DateTimeFilter,
) {
  return prisma.order.findMany({
    where: {
      businessId,
      status: 'DELIVERED',
      ...(createdAtRange && { createdAt: createdAtRange }),
    },
    select: {
      id: true,
      price: true,
      createdAt: true,
      statusHistory: {
        where: { status: 'DELIVERED' },
        orderBy: { changedAt: 'desc' },
        take: 1,
        select: { changedAt: true },
      },
    },
  })
}

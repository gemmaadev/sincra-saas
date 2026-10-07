import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'

const ACTIVE_CLIENT_TAGS_INCLUDE = {
  clientTags: { where: { removedAt: null }, include: { tag: true } },
} satisfies Prisma.ClientInclude

const CLIENT_DETAIL_INCLUDE = {
  ...ACTIVE_CLIENT_TAGS_INCLUDE,
  orders: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      number: true,
      status: true,
      kind: true,
      channel: true,
      price: true,
      expectedDate: true,
      createdAt: true,
    },
  },
} satisfies Prisma.ClientInclude

export async function insertClient(data: Prisma.ClientUncheckedCreateInput) {
  return prisma.client.create({ data })
}

export async function findClientsPage(where: Prisma.ClientWhereInput, skip: number, take: number) {
  return prisma.client.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: ACTIVE_CLIENT_TAGS_INCLUDE,
  })
}

export async function countClients(where: Prisma.ClientWhereInput) {
  return prisma.client.count({ where })
}

export async function findClientById(businessId: string, clientId: string) {
  return prisma.client.findUnique({ where: { id: clientId, businessId } })
}

export async function findClientWithDetails(businessId: string, clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId, businessId },
    include: CLIENT_DETAIL_INCLUDE,
  })
}

export async function updateClientById(clientId: string, data: Prisma.ClientUpdateInput) {
  return prisma.client.update({ where: { id: clientId }, data })
}

export async function deleteClientById(clientId: string) {
  await prisma.client.delete({ where: { id: clientId } })
}

export async function findActiveClientTag(clientId: string, tagId: string) {
  return prisma.clientTag.findFirst({ where: { clientId, tagId, removedAt: null } })
}

export async function insertClientTag(clientId: string, tagId: string) {
  return prisma.clientTag.create({ data: { clientId, tagId }, include: { tag: true } })
}

export async function markClientTagRemoved(clientTagId: string) {
  await prisma.clientTag.update({ where: { id: clientTagId }, data: { removedAt: new Date() } })
}

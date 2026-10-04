import prisma from '../../config/db'
import { Prisma } from '../../generated/prisma/client'

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002'

const ACTIVE_CLIENT_TAGS_INCLUDE = {
  clientTags: { where: { removedAt: null }, include: { tag: true } },
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

export async function findClientWithTags(businessId: string, clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId, businessId },
    include: ACTIVE_CLIENT_TAGS_INCLUDE,
  })
}

export async function updateClientById(clientId: string, data: Prisma.ClientUpdateInput) {
  return prisma.client.update({ where: { id: clientId }, data })
}

export async function deleteClientById(clientId: string) {
  await prisma.client.delete({ where: { id: clientId } })
}

export function getUniqueViolationFields(error: unknown): string[] | null {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== UNIQUE_CONSTRAINT_ERROR_CODE
  ) {
    return null
  }

  const target = error.meta?.target
  return Array.isArray(target) ? target.map(String) : [String(target ?? '')]
}

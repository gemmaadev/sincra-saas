import type { Prisma } from '../../generated/prisma/client'
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination'
import { AppError } from '../../shared/AppError'
import {
  insertClient,
  findClientsPage,
  countClients,
  findClientById,
  findClientWithTags,
  updateClientById,
  deleteClientById,
} from './client.model'
import type { CreateClientInput, UpdateClientInput, ListClientsFilters } from './client.types'

export async function createClient(businessId: string, input: CreateClientInput) {
  return insertClient({
    businessId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    channels: input.channels ?? [],
    type: input.type,
    address: input.address,
    zone: input.zone,
    latitude: input.latitude,
    longitude: input.longitude,
  })
}

export async function listClients(businessId: string, filters: ListClientsFilters) {
  const { page, limit, skip } = parsePagination(filters)

  const where: Prisma.ClientWhereInput = {
    businessId,
    ...(filters.channel && { channels: { has: filters.channel } }),
    ...(filters.type && { type: filters.type }),
    ...(filters.tagId && {
      clientTags: { some: { tagId: filters.tagId, removedAt: null } },
    }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [data, total, newClientsCount] = await Promise.all([
    findClientsPage(where, skip, limit),
    countClients(where),
    countClients({ ...where, createdAt: { gte: thirtyDaysAgo } }),
  ])

  return { ...buildPaginatedResponse(data, total, page, limit), newClientsCount }
}

// TODO: once the Order (and later Communication) models exist, include them here too.
export async function getClientById(businessId: string, clientId: string) {
  return findClientWithTags(businessId, clientId)
}

export async function updateClient(businessId: string, clientId: string, input: UpdateClientInput) {
  await assertClientExists(businessId, clientId)

  return updateClientById(clientId, input)
}

export async function deleteClient(businessId: string, clientId: string) {
  await assertClientExists(businessId, clientId)

  await deleteClientById(clientId)
}

async function assertClientExists(businessId: string, clientId: string) {
  const existing = await findClientById(businessId, clientId)

  if (!existing) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }
}

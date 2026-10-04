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
  getUniqueViolationFields,
} from './client.model'
import type { CreateClientInput, UpdateClientInput, ListClientsFilters } from './client.types'

function describeDuplicate(fields: string[]): string {
  const target = fields.join(' ')

  if (target.includes('email')) return 'Ya existe un cliente con ese email'
  if (target.includes('phone')) return 'Ya existe un cliente con ese teléfono'
  return 'Ya existe un cliente con esos datos'
}

async function rejectDuplicates<T>(save: () => Promise<T>): Promise<T> {
  try {
    return await save()
  } catch (error) {
    const duplicatedFields = getUniqueViolationFields(error)

    if (duplicatedFields) {
      throw new AppError(describeDuplicate(duplicatedFields), 409, 'DUPLICATE_CLIENT')
    }

    throw error
  }
}

export async function createClient(businessId: string, input: CreateClientInput) {
  return rejectDuplicates(() =>
    insertClient({
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
    }),
  )
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

  return rejectDuplicates(() => updateClientById(clientId, input))
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

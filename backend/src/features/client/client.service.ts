import prisma from '../../config/db'
import type { Channel, Prisma } from '../../generated/prisma/client'
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination'
import type { PaginationQuery } from '../../shared/utils/pagination.types'
import { AppError } from '../../shared/AppError'

interface CreateClientInput {
  name: string
  email?: string
  phone?: string
  channels?: Channel[]
  type?: string
  address?: string
  zone?: string
  latitude?: number
  longitude?: number
}

export async function createClient(businessId: string, input: CreateClientInput) {
  return prisma.client.create({
    data: {
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
    },
  })
}

interface ListClientsFilters extends PaginationQuery {
  channel?: Channel
  type?: string
  tagId?: string
  search?: string
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

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        clientTags: { where: { removedAt: null }, include: { tag: true } },
      },
    }),
    prisma.client.count({ where }),
  ])

  return buildPaginatedResponse(data, total, page, limit)
}

// TODO: once the Order (and later Communication) models exist, include them here too.
export async function getClientById(businessId: string, clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId, businessId },
    include: {
      clientTags: { where: { removedAt: null }, include: { tag: true } },
    },
  })
}

interface UpdateClientInput {
  name?: string
  email?: string
  phone?: string
  channels?: Channel[]
  type?: string
  address?: string
  zone?: string
  latitude?: number
  longitude?: number
}

export async function updateClient(businessId: string, clientId: string, input: UpdateClientInput) {
  const existing = await prisma.client.findUnique({ where: { id: clientId, businessId } })

  if (!existing) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }

  return prisma.client.update({
    where: { id: clientId },
    data: input,
  })
}

export async function deleteClient(businessId: string, clientId: string) {
  const existing = await prisma.client.findUnique({ where: { id: clientId, businessId } })

  if (!existing) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }

  await prisma.client.delete({ where: { id: clientId } })
}

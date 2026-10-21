import type { Prisma } from '../../generated/prisma/client'
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination'
import { AppError } from '../../shared/AppError'
import {
  insertClient,
  findClientsPage,
  countClients,
  countRecurringClients,
  findClientById,
  findClientWithDetails,
  updateClientById,
  deleteClientById,
  findActiveClientTag,
  insertClientTag,
  markClientTagRemoved,
} from './client.model'
import { resolveOrderDescription } from '../order/order.service'
import { countOrdersByClientId } from '../order/order.model'
import { findTagById } from '../tag/tag.model'
import { findBusinessCountry } from '../auth/auth.model'
import { geocodeAddress, searchAddresses } from '../../shared/services/geocoding.service'
import type { GeocodedLocation } from '../../shared/services/geocoding.service'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
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

async function geocodeClientLocation(
  businessId: string,
  address?: string | null,
  zone?: string | null,
): Promise<GeocodedLocation | null> {
  if (!address?.trim() && !zone?.trim()) return null

  const countryCode = await findBusinessCountry(businessId)

  return geocodeAddress({ address, zone, countryCode: countryCode ?? undefined })
}

async function locateClient(
  businessId: string,
  input: CreateClientInput,
): Promise<GeocodedLocation | null> {
  if (input.latitude !== undefined && input.longitude !== undefined) {
    return { latitude: input.latitude, longitude: input.longitude }
  }

  return geocodeClientLocation(businessId, input.address, input.zone)
}

export async function createClient(businessId: string, input: CreateClientInput) {
  const location = await locateClient(businessId, input)

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
      latitude: location?.latitude,
      longitude: location?.longitude,
    }),
  )
}

export async function searchClientAddress(businessId: string, query: string) {
  const countryCode = await findBusinessCountry(businessId)
  const candidates = await searchAddresses(query, countryCode ?? undefined)

  if (!candidates) {
    throw new AppError(
      'No se ha podido buscar la dirección. Inténtalo de nuevo.',
      502,
      'GEOCODING_UNAVAILABLE',
    )
  }

  return candidates
}

function mapClientRow(client: Awaited<ReturnType<typeof findClientsPage>>[number]) {
  const { orders, _count, ...rest } = client

  return { ...rest, orderCount: _count.orders, lastOrderAt: orders[0]?.createdAt ?? null }
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

  const [data, total, newClientsCount, recurringClientsCount, potentialClientsCount] =
    await Promise.all([
      findClientsPage(where, skip, limit),
      countClients(where),
      countClients({ ...where, createdAt: { gte: thirtyDaysAgo } }),
      countRecurringClients(where),
      countClients({ ...where, orders: { none: {} } }),
    ])

  return {
    ...buildPaginatedResponse(data.map(mapClientRow), total, page, limit),
    newClientsCount,
    recurringClientsCount,
    potentialClientsCount,
  }
}

function mapOrderSummary(
  order: NonNullable<Awaited<ReturnType<typeof findClientWithDetails>>>['orders'][number],
) {
  const { items, ...rest } = order
  return { ...rest, description: resolveOrderDescription(order) }
}

// TODO: once the Communication model exists (if Epic 2 is ever picked back up), include it here too.
export async function getClientById(businessId: string, clientId: string) {
  const client = await findClientWithDetails(businessId, clientId)

  if (!client) return null

  return { ...client, orders: client.orders.map(mapOrderSummary) }
}

function hasTextChanged(newValue: string | null | undefined, currentValue: string | null): boolean {
  return newValue !== undefined && (newValue?.trim() || null) !== (currentValue?.trim() || null)
}

async function relocateClient(
  businessId: string,
  existing: { address: string | null; zone: string | null },
  input: UpdateClientInput,
): Promise<GeocodedLocation | null> {
  if (input.latitude !== undefined && input.longitude !== undefined) return null

  const addressChanged = hasTextChanged(input.address, existing.address)
  const zoneChanged = hasTextChanged(input.zone, existing.zone)
  if (!addressChanged && !zoneChanged) return null

  return geocodeClientLocation(
    businessId,
    input.address === undefined ? existing.address : input.address,
    input.zone === undefined ? existing.zone : input.zone,
  )
}

export async function updateClient(businessId: string, clientId: string, input: UpdateClientInput) {
  const existing = await assertClientExists(businessId, clientId)
  const location = await relocateClient(businessId, existing, input)

  return rejectDuplicates(() =>
    updateClientById(clientId, {
      ...input,
      ...(location && { latitude: location.latitude, longitude: location.longitude }),
    }),
  )
}

export async function deleteClient(businessId: string, clientId: string) {
  await assertClientExists(businessId, clientId)

  const orderCount = await countOrdersByClientId(clientId)
  if (orderCount > 0) {
    throw new AppError(
      'No se puede eliminar un cliente con pedidos asociados. Elimina o reasigna sus pedidos primero.',
      409,
      'CLIENT_HAS_ORDERS',
    )
  }

  await deleteClientById(clientId)
}

export async function assignTagToClient(businessId: string, clientId: string, tagId: string) {
  await assertClientExists(businessId, clientId)

  const tag = await findTagById(businessId, tagId)
  if (!tag) {
    throw new AppError('Etiqueta no encontrada', 404, 'TAG_NOT_FOUND')
  }

  const activeAssignment = await findActiveClientTag(clientId, tagId)
  if (activeAssignment) {
    throw new AppError('Este cliente ya tiene esa etiqueta', 409, 'TAG_ALREADY_ASSIGNED')
  }

  return insertClientTag(clientId, tagId)
}

export async function removeTagFromClient(businessId: string, clientId: string, tagId: string) {
  await assertClientExists(businessId, clientId)

  const activeAssignment = await findActiveClientTag(clientId, tagId)
  if (!activeAssignment) {
    throw new AppError('El cliente no tiene esa etiqueta', 404, 'CLIENT_TAG_NOT_FOUND')
  }

  await markClientTagRemoved(activeAssignment.id)
}

async function assertClientExists(businessId: string, clientId: string) {
  const existing = await findClientById(businessId, clientId)

  if (!existing) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }

  return existing
}

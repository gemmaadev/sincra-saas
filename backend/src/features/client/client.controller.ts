import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import {
  createClient,
  listClients,
  getClientById,
  updateClient,
  deleteClient,
  assignTagToClient,
  removeTagFromClient,
  searchClientAddress,
} from './client.service'
import type {
  CreateClientInput,
  UpdateClientInput,
  ListClientsFilters,
  AssignTagBody,
} from './client.types'

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, channels, type, address, zone, latitude, longitude } =
    req.body as CreateClientInput

  if (!name?.trim()) {
    throw new AppError('El nombre es obligatorio', 400, 'MISSING_FIELDS')
  }

  if (!channels || channels.length === 0) {
    throw new AppError('Indica al menos un canal de contacto', 400, 'MISSING_CHANNEL')
  }

  const client = await createClient(req.businessId!, {
    name,
    email,
    phone,
    channels,
    type,
    address,
    zone,
    latitude,
    longitude,
  })

  res.status(201).json({ client })
})

const MIN_ADDRESS_QUERY_LENGTH = 3
const MAX_ADDRESS_QUERY_LENGTH = 200

export const searchAddress = asyncHandler(async (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''

  if (query.length < MIN_ADDRESS_QUERY_LENGTH || query.length > MAX_ADDRESS_QUERY_LENGTH) {
    throw new AppError(
      `La búsqueda debe tener entre ${MIN_ADDRESS_QUERY_LENGTH} y ${MAX_ADDRESS_QUERY_LENGTH} caracteres`,
      400,
      'INVALID_QUERY',
    )
  }

  const candidates = await searchClientAddress(req.businessId!, query)

  res.json({ candidates })
})

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, channel, type, tagId, search } = req.query as ListClientsFilters

  const result = await listClients(req.businessId!, { page, limit, channel, type, tagId, search })

  res.json(result)
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const client = await getClientById(req.businessId!, req.params.id as string)

  if (!client) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }

  res.json({ client })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateClientInput

  if (body.name !== undefined && !body.name.trim()) {
    throw new AppError('El nombre no puede estar vacío', 400, 'INVALID_NAME')
  }

  const client = await updateClient(req.businessId!, req.params.id as string, body)

  res.json({ client })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteClient(req.businessId!, req.params.id as string)

  res.status(204).send()
})

export const assignTag = asyncHandler(async (req: Request, res: Response) => {
  const { tagId } = req.body as AssignTagBody

  if (typeof tagId !== 'string' || !tagId) {
    throw new AppError('Indica la etiqueta', 400, 'MISSING_FIELDS')
  }

  const clientTag = await assignTagToClient(req.businessId!, req.params.id as string, tagId)

  res.status(201).json({ clientTag })
})

export const removeTag = asyncHandler(async (req: Request, res: Response) => {
  await removeTagFromClient(req.businessId!, req.params.id as string, req.params.tagId as string)

  res.status(204).send()
})

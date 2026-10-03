import type { Channel } from '../../generated/prisma/client'
import type { PaginationQuery } from '../../shared/utils/pagination.types'

export interface CreateClientInput {
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

export interface UpdateClientInput {
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

export interface ListClientsFilters extends PaginationQuery {
  channel?: Channel
  type?: string
  tagId?: string
  search?: string
}

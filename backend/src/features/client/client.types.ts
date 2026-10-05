import type { Channel } from '../../generated/prisma/client'
import type { PaginationQuery } from '../../shared/utils/pagination.types'

export interface CreateClientInput {
  name: string
  email?: string | null
  phone?: string | null
  channels?: Channel[]
  type?: string | null
  address?: string | null
  zone?: string | null
  latitude?: number
  longitude?: number
}

export interface UpdateClientInput {
  name?: string
  email?: string | null
  phone?: string | null
  channels?: Channel[]
  type?: string | null
  address?: string | null
  zone?: string | null
  latitude?: number
  longitude?: number
}

export interface ListClientsFilters extends PaginationQuery {
  channel?: Channel
  type?: string
  tagId?: string
  search?: string
}

export interface AssignTagBody {
  tagId: string
}

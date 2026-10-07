import type { Tag } from '@/features/tags/types/tag.types'
import type { Channel } from '@/shared/types'

export interface ClientTag {
  id: string
  tagId: string
  aiGenerated: boolean
  tag: Tag
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  channels: Channel[]
  type: string | null
  zone: string | null
  clientTags: ClientTag[]
  createdAt: string
  updatedAt: string
}

export interface ClientDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  channels: Channel[]
  type: string | null
  address: string | null
  zone: string | null
  latitude: number | null
  longitude: number | null
  lastContact: string | null
  clientTags: ClientTag[]
  createdAt: string
  updatedAt: string
}

export interface ClientsResponse {
  data: Client[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  newClientsCount: number
}

export interface ClientDetailResponse {
  client: ClientDetail
}

export interface UseClientsParams {
  page?: number
  limit?: number
  search?: string
  channel?: Channel
  type?: string
  tagId?: string
}

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface AddressCandidate extends Coordinates {
  label: string
  address: string | null
  zone: string | null
}

export interface ClientFormValues {
  name: string
  email: string
  phone: string
  channels: Channel[]
  type: string
  zone: string
  address: string
  latitude?: number
  longitude?: number
}

export interface ClientPayload {
  name: string
  email: string | null
  phone: string | null
  channels: Channel[]
  type: string | null
  zone: string | null
  address: string | null
  latitude?: number
  longitude?: number
}

export interface ClientMutationResponse {
  client: ClientDetail
}

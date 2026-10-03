export type ChannelFilter = 'GMAIL' | 'OUTLOOK' | 'WHATSAPP' | 'INSTAGRAM' | 'MESSENGER'

export interface Tag {
  id: string
  name: string
  color: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  isDefault: boolean
}

export interface ClientTag {
  id: string
  tagId: string
  tag: Tag
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  channels: ChannelFilter[]
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
  channels: ChannelFilter[]
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
  channel?: ChannelFilter
  type?: string
  tagId?: string
}

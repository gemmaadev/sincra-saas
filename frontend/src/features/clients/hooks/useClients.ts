import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'

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

interface ClientsResponse {
  data: Client[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UseClientsParams {
  page?: number
  limit?: number
  search?: string
  channel?: ChannelFilter
  type?: string
  tagId?: string
}

export function useClients(params: UseClientsParams = {}) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      const query = new URLSearchParams()
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))
      if (params.search) query.set('search', params.search)
      if (params.channel) query.set('channel', params.channel)
      if (params.type) query.set('type', params.type)
      if (params.tagId) query.set('tagId', params.tagId)

      const queryString = query.toString()
      return api.get<ClientsResponse>(`/clients${queryString ? `?${queryString}` : ''}`)
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ChannelFilter, ClientTag } from './useClients'

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
  notes: string | null
  lastContact: string | null
  clientTags: ClientTag[]
  createdAt: string
  updatedAt: string
}

interface ClientDetailResponse {
  client: ClientDetail
}

export function useClientDetail(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { client } = await api.get<ClientDetailResponse>(`/clients/${id}`)
      return client
    },
  })
}

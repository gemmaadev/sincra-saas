import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ClientsResponse, UseClientsParams } from '../types/client.types'

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

import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ClientMapResponse, MapFilters } from '../types/map.types'

export function useClientsMap(filters: MapFilters = {}) {
  return useQuery({
    queryKey: ['clients', 'map', filters],
    queryFn: async () => {
      const query = new URLSearchParams()
      if (filters.channel) query.set('channel', filters.channel)
      if (filters.type) query.set('type', filters.type)
      if (filters.from) query.set('from', filters.from)
      if (filters.to) query.set('to', filters.to)

      const queryString = query.toString()
      return api.get<ClientMapResponse>(`/clients/map${queryString ? `?${queryString}` : ''}`)
    },
  })
}

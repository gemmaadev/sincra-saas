import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { OrderMapResponse, MapFilters } from '../types/map.types'

export function useOrdersMap(filters: MapFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ['orders', 'map', filters],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const query = new URLSearchParams()
      if (filters.channel) query.set('channel', filters.channel)
      if (filters.from) query.set('from', filters.from)
      if (filters.to) query.set('to', filters.to)

      const queryString = query.toString()
      return api.get<OrderMapResponse>(`/orders/map${queryString ? `?${queryString}` : ''}`)
    },
  })
}

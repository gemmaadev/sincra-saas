import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ClientSearchResult } from '../types/order.types'

const SEARCH_RESULTS_LIMIT = 5

interface ClientsSearchResponse {
  data: ClientSearchResult[]
}

export function useSearchClients(query: string) {
  return useQuery({
    queryKey: ['clients-search', query],
    enabled: query.length > 0,
    queryFn: async () => {
      const { data } = await api.get<ClientsSearchResponse>(
        `/clients?search=${encodeURIComponent(query)}&limit=${SEARCH_RESULTS_LIMIT}`,
      )
      return data
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { CalendarOrderSearchResult } from '../types/calendar.types'

const SEARCH_RESULTS_LIMIT = 5

interface OrderSearchRow {
  id: string
  number: number
  client: { name: string }
}

interface OrdersSearchResponse {
  data: OrderSearchRow[]
}

export function useSearchOrders(query: string) {
  return useQuery({
    queryKey: ['orders-search', query],
    enabled: query.length > 0,
    queryFn: async (): Promise<CalendarOrderSearchResult[]> => {
      const { data } = await api.get<OrdersSearchResponse>(
        `/orders?search=${encodeURIComponent(query)}&limit=${SEARCH_RESULTS_LIMIT}`,
      )
      return data.map((order) => ({
        id: order.id,
        number: order.number,
        clientName: order.client.name,
      }))
    },
  })
}

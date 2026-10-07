import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { OrdersResponse, UseOrdersParams } from '../types/order.types'

export function useOrders(params: UseOrdersParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const query = new URLSearchParams()
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))
      if (params.status) query.set('status', params.status)
      if (params.channel) query.set('channel', params.channel)
      if (params.dateFrom) query.set('dateFrom', params.dateFrom)
      if (params.dateTo) query.set('dateTo', params.dateTo)

      const queryString = query.toString()
      return api.get<OrdersResponse>(`/orders${queryString ? `?${queryString}` : ''}`)
    },
  })
}

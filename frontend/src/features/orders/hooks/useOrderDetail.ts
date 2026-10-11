import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { OrderDetailResponse } from '../types/order.types'

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { order } = await api.get<OrderDetailResponse>(`/orders/${id}`)
      return order
    },
  })
}

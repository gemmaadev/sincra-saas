import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'
import type { OrderStatus } from '../types/order.types'

export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (status: OrderStatus) => {
      await api.patch(`/orders/${orderId}`, { status })
    },
    onSuccess: () => invalidateOrderQueries(queryClient, orderId),
  })
}

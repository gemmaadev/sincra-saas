import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'

export function useBulkCancelOrders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const results = await Promise.allSettled(
        orderIds.map((orderId) => api.patch(`/orders/${orderId}`, { status: 'CANCELLED' })),
      )

      const failedIds = orderIds.filter(
        (_orderId, index) => results[index]?.status === 'rejected',
      )

      return { failedIds }
    },
    onSettled: () => invalidateOrderQueries(queryClient),
  })
}

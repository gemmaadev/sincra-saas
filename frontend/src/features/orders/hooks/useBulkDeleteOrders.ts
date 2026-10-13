import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { bulkDelete } from '@/shared/utils'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'

export function useBulkDeleteOrders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderIds: string[]) =>
      bulkDelete(orderIds, (orderId) => api.delete(`/orders/${orderId}`)),
    onSettled: () => invalidateOrderQueries(queryClient),
  })
}

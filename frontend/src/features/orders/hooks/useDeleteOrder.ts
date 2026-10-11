import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'

export function useDeleteOrder(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/orders/${orderId}`)
    },
    onSuccess: () => invalidateOrderQueries(queryClient),
  })
}

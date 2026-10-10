import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'

export function useRemoveOrderTag(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tagId: string) => {
      await api.delete(`/orders/${orderId}/tags/${tagId}`)
    },
    onSuccess: () => invalidateOrderQueries(queryClient, orderId),
  })
}

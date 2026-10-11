import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'

export function useAssignOrderTag(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tagId: string) => {
      await api.post(`/orders/${orderId}/tags`, { tagId })
    },
    onSuccess: () => invalidateOrderQueries(queryClient, orderId),
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'

export function useMarkOrderIncident(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (incidentNote: string) => {
      await api.patch(`/orders/${orderId}`, { status: 'INCIDENT', incidentNote })
    },
    onSuccess: () => {
      invalidateOrderQueries(queryClient, orderId)
      queryClient.invalidateQueries({ queryKey: ['order-notes', orderId] })
    },
  })
}

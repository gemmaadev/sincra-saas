import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'
import type { OrderStatus } from '../types/order.types'

interface ResolveIncidentInput {
  status: OrderStatus
  resolutionNote: string
}

export function useResolveOrderIncident(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ status, resolutionNote }: ResolveIncidentInput) => {
      await api.patch(`/orders/${orderId}`, { status, resolutionNote })
    },
    onSuccess: () => {
      invalidateOrderQueries(queryClient, orderId)
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { toOrderPayload } from '../utils/toOrderPayload'
import { invalidateOrderQueries } from '../utils/invalidateOrderQueries'
import type { OrderFormValues, OrderMutationResponse } from '../types/order.types'

export function useSaveOrder(orderId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: OrderFormValues) => {
      const payload = toOrderPayload(values)
      const { order } = orderId
        ? await api.patch<OrderMutationResponse>(`/orders/${orderId}`, payload)
        : await api.post<OrderMutationResponse>('/orders', payload)
      return order
    },
    onSuccess: () => invalidateOrderQueries(queryClient, orderId),
  })
}

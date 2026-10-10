import type { QueryClient } from '@tanstack/react-query'

export function invalidateOrderQueries(queryClient: QueryClient, orderId?: string) {
  queryClient.invalidateQueries({ queryKey: ['orders'] })

  if (orderId) {
    queryClient.invalidateQueries({ queryKey: ['order', orderId] })
  }
}

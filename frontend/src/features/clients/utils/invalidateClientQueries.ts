import type { QueryClient } from '@tanstack/react-query'

export function invalidateClientQueries(queryClient: QueryClient, clientId?: string) {
  queryClient.invalidateQueries({ queryKey: ['clients'] })

  if (clientId) {
    queryClient.invalidateQueries({ queryKey: ['client', clientId] })
  }
}

import type { QueryClient } from '@tanstack/react-query'

export function invalidateClientQueries(queryClient: QueryClient, clientId?: string) {
  queryClient.invalidateQueries({ queryKey: ['clients'] })
  queryClient.invalidateQueries({ queryKey: ['stats'] })
  queryClient.invalidateQueries({ queryKey: ['calendar'] })

  if (clientId) {
    queryClient.invalidateQueries({ queryKey: ['client', clientId] })
  }
}

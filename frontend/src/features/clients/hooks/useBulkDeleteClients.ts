import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { bulkDelete } from '@/shared/utils'
import { invalidateClientQueries } from '../utils/invalidateClientQueries'

export function useBulkDeleteClients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clientIds: string[]) =>
      bulkDelete(clientIds, (clientId) => api.delete(`/clients/${clientId}`)),
    onSettled: () => invalidateClientQueries(queryClient),
  })
}

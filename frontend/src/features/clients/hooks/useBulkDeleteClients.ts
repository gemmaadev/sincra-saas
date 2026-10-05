import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/shared/services'

function isAlreadyDeleted(reason: unknown): boolean {
  return reason instanceof ApiError && reason.status === 404
}

export function useBulkDeleteClients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientIds: string[]) => {
      const results = await Promise.allSettled(
        clientIds.map((clientId) => api.delete(`/clients/${clientId}`)),
      )

      const failedIds = clientIds.filter((_clientId, index) => {
        const result = results[index]
        return result.status === 'rejected' && !isAlreadyDeleted(result.reason)
      })

      return { failedIds }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

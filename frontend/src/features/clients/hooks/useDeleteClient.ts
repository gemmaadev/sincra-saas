import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateClientQueries } from '../utils/invalidateClientQueries'

export function useDeleteClient(clientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/clients/${clientId}`)
    },
    onSuccess: () => invalidateClientQueries(queryClient),
  })
}

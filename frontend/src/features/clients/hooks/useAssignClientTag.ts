import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { invalidateClientQueries } from '../utils/invalidateClientQueries'

export function useAssignClientTag(clientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tagId: string) => {
      await api.post(`/clients/${clientId}/tags`, { tagId })
    },
    onSuccess: () => invalidateClientQueries(queryClient, clientId),
  })
}

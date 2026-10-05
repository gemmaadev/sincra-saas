import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'

export function useDeleteClient(clientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/clients/${clientId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'

export function useDeleteNote(clientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/notes/${noteId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] })
    },
  })
}

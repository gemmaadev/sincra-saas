import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Note } from '@/shared/types'

export function useCreateNote(clientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      const { note } = await api.post<{ note: Note }>(`/clients/${clientId}/notes`, { content })
      return note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] })
    },
  })
}

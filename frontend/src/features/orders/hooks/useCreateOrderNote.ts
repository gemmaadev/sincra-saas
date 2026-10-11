import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Note } from '@/shared/types'

export function useCreateOrderNote(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      const { note } = await api.post<{ note: Note }>(`/orders/${orderId}/notes`, { content })
      return note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-notes', orderId] })
    },
  })
}

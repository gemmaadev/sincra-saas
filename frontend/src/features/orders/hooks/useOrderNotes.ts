import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Note } from '@/shared/types'

export function useOrderNotes(orderId: string) {
  return useQuery({
    queryKey: ['order-notes', orderId],
    queryFn: async () => {
      const { notes } = await api.get<{ notes: Note[] }>(`/orders/${orderId}/notes`)
      return notes
    },
  })
}

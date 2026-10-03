import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'

export interface Note {
  id: string
  clientId: string
  content: string
  createdBy: string | null
  createdAt: string
}

export function useClientNotes(clientId: string) {
  return useQuery({
    queryKey: ['client-notes', clientId],
    queryFn: async () => {
      const { notes } = await api.get<{ notes: Note[] }>(`/clients/${clientId}/notes`)
      return notes
    },
  })
}

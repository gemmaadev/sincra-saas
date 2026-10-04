import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Note } from '../types/note.types'

export function useClientNotes(clientId: string) {
  return useQuery({
    queryKey: ['client-notes', clientId],
    queryFn: async () => {
      const { notes } = await api.get<{ notes: Note[] }>(`/clients/${clientId}/notes`)
      return notes
    },
  })
}

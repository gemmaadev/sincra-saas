import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'

export function useDeleteCalendarEvent(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/calendar/${eventId}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  })
}

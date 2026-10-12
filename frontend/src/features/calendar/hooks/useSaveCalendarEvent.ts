import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { toCalendarEventPayload } from '../utils/toCalendarEventPayload'
import type {
  CalendarEventFormValues,
  CalendarEventMutationResponse,
} from '../types/calendar.types'

export function useSaveCalendarEvent(eventId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CalendarEventFormValues) => {
      const payload = toCalendarEventPayload(values)
      const { event } = eventId
        ? await api.patch<CalendarEventMutationResponse>(`/calendar/${eventId}`, payload)
        : await api.post<CalendarEventMutationResponse>('/calendar', payload)
      return event
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  })
}

import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { CalendarEventMutationResponse, CalendarItem } from '../types/calendar.types'

interface RescheduleCalendarEventInput {
  eventId: string
  date: string
  endDate: string
}

export function useRescheduleCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, date, endDate }: RescheduleCalendarEventInput) => {
      const { event } = await api.patch<CalendarEventMutationResponse>(
        `/calendar/${eventId}/reschedule`,
        { date, endDate },
      )
      return event
    },
    // Optimistic update: move the event in the cache immediately, instead of waiting
    // for the request to resolve, so the calendar doesn't lag or flicker on drop.
    onMutate: async ({ eventId, date, endDate }) => {
      const queries = queryClient.getQueriesData<CalendarItem[]>({ queryKey: ['calendar', 'events'] })

      queryClient.setQueriesData<CalendarItem[]>({ queryKey: ['calendar', 'events'] }, (items) =>
        items?.map((item) => (item.id === eventId ? { ...item, date, endDate } : item)),
      )

      return { queries }
    },
    onError: (_error, _variables, context) => {
      context?.queries.forEach(([queryKey, data]: [QueryKey, CalendarItem[] | undefined]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  })
}

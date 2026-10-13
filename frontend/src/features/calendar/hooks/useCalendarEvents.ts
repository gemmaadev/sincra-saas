import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { CalendarEventsFilters, CalendarItem } from '../types/calendar.types'

export function useCalendarEvents(filters: CalendarEventsFilters) {
  return useQuery({
    queryKey: ['calendar', 'events', filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const query = new URLSearchParams({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      })

      const { events } = await api.get<{ events: CalendarItem[] }>(`/calendar?${query.toString()}`)
      return events
    },
  })
}

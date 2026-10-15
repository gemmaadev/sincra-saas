import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { StatsDashboard, StatsFilters } from '../types/stats.types'

export function useStats(filters: StatsFilters) {
  return useQuery({
    queryKey: ['stats', 'dashboard', filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const query = new URLSearchParams()
      if (filters.dateFrom) query.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) query.set('dateTo', filters.dateTo)
      if (filters.granularity) query.set('granularity', filters.granularity)

      const queryString = query.toString()
      return api.get<StatsDashboard>(`/stats/dashboard${queryString ? `?${queryString}` : ''}`)
    },
  })
}

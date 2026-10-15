import { useState } from 'react'
import { useFiltersStore } from '@/shared/store'
import type { OrdersEvolutionGranularity, StatsFilters } from '../types/stats.types'

export function useStatsFilters() {
  const dateFrom = useFiltersStore((state) => state.dateFrom)
  const dateTo = useFiltersStore((state) => state.dateTo)
  const setDateFrom = useFiltersStore((state) => state.setDateFrom)
  const setDateTo = useFiltersStore((state) => state.setDateTo)
  const [granularity, setGranularity] = useState<OrdersEvolutionGranularity>('daily')

  const isDateRangeInvalid = dateFrom !== '' && dateTo !== '' && dateFrom > dateTo

  const filters: StatsFilters = {
    dateFrom: isDateRangeInvalid ? undefined : dateFrom || undefined,
    dateTo: isDateRangeInvalid ? undefined : dateTo || undefined,
    granularity,
  }

  return {
    dateFrom,
    dateTo,
    granularity,
    setDateFrom,
    setDateTo,
    setGranularity,
    filters,
    isDateRangeInvalid,
  }
}

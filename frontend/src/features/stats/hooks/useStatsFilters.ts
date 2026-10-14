import { useState } from 'react'
import type { OrdersEvolutionGranularity, StatsFilters } from '../types/stats.types'

export function useStatsFilters() {
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
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

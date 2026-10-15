import { useFiltersStore } from '@/shared/store'
import type { MapFilters } from '../types/map.types'

export function useMapFilters() {
  const channel = useFiltersStore((state) => state.channel)
  const from = useFiltersStore((state) => state.dateFrom)
  const to = useFiltersStore((state) => state.dateTo)
  const setChannel = useFiltersStore((state) => state.setChannel)
  const setFrom = useFiltersStore((state) => state.setDateFrom)
  const setTo = useFiltersStore((state) => state.setDateTo)
  const clearFilters = useFiltersStore((state) => state.clearFilters)

  const isDateRangeInvalid = from !== '' && to !== '' && from > to
  const hasActiveFilters = channel !== '' || from !== '' || to !== ''

  const filters: MapFilters = {
    channel: channel || undefined,
    from: isDateRangeInvalid ? undefined : from || undefined,
    to: isDateRangeInvalid ? undefined : to || undefined,
  }

  return {
    channel,
    from,
    to,
    setChannel,
    setFrom,
    setTo,
    filters,
    isDateRangeInvalid,
    hasActiveFilters,
    clearFilters,
  }
}

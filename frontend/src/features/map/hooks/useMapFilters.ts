import { useState } from 'react'
import type { Channel } from '@/shared/types'
import type { MapFilters } from '../types/map.types'

export function useMapFilters() {
  const [channel, setChannel] = useState<Channel | ''>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const isDateRangeInvalid = from !== '' && to !== '' && from > to
  const hasActiveFilters = channel !== '' || from !== '' || to !== ''

  const filters: MapFilters = {
    channel: channel || undefined,
    from: isDateRangeInvalid ? undefined : from || undefined,
    to: isDateRangeInvalid ? undefined : to || undefined,
  }

  function clearFilters() {
    setChannel('')
    setFrom('')
    setTo('')
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

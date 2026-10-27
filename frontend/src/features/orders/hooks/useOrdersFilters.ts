import { useState } from 'react'
import { useDebouncedValue } from '@/shared/hooks'
import { useFiltersStore } from '@/shared/store'
import type { Channel } from '@/shared/types'
import type { OrderStatus, UseOrdersParams } from '../types/order.types'

const ORDERS_PAGE_SIZE = 10

export function useOrdersFilters() {
  const [search, setSearch] = useState<string>('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const channel = useFiltersStore((state) => state.channel)
  const dateFrom = useFiltersStore((state) => state.dateFrom)
  const dateTo = useFiltersStore((state) => state.dateTo)
  const setChannelInStore = useFiltersStore((state) => state.setChannel)
  const setDateFromInStore = useFiltersStore((state) => state.setDateFrom)
  const setDateToInStore = useFiltersStore((state) => state.setDateTo)
  const clearFiltersInStore = useFiltersStore((state) => state.clearFilters)
  const [page, setPage] = useState<number>(1)
  const debouncedSearch = useDebouncedValue(search)

  const isDateRangeInvalid = dateFrom !== '' && dateTo !== '' && dateFrom > dateTo
  const hasActiveFilters = search !== '' || status !== '' || channel !== '' || dateFrom !== '' || dateTo !== ''

  function clearFilters() {
    setSearch('')
    setStatus('')
    clearFiltersInStore()
    setPage(1)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function changeStatus(value: OrderStatus | '') {
    setStatus(value)
    setPage(1)
  }

  function changeChannel(value: Channel | '') {
    setChannelInStore(value)
    setPage(1)
  }

  function changeDateFrom(value: string) {
    setDateFromInStore(value)
    setPage(1)
  }

  function changeDateTo(value: string) {
    setDateToInStore(value)
    setPage(1)
  }

  const queryParams: UseOrdersParams = {
    page,
    limit: ORDERS_PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
    channel: channel || undefined,
    dateFrom: isDateRangeInvalid ? undefined : dateFrom || undefined,
    dateTo: isDateRangeInvalid ? undefined : dateTo || undefined,
  }

  return {
    search,
    status,
    channel,
    dateFrom,
    dateTo,
    page,
    setPage,
    changeSearch,
    changeStatus,
    changeChannel,
    changeDateFrom,
    changeDateTo,
    isDateRangeInvalid,
    hasActiveFilters,
    clearFilters,
    queryParams,
  }
}

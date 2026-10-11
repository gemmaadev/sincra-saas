import { useState } from 'react'
import { useDebouncedValue } from '@/shared/hooks'
import type { Channel } from '@/shared/types'
import type { OrderStatus, UseOrdersParams } from '../types/order.types'

const ORDERS_PAGE_SIZE = 10

export function useOrdersFilters() {
  const [search, setSearch] = useState<string>('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [channel, setChannel] = useState<Channel | ''>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const debouncedSearch = useDebouncedValue(search)

  const isDateRangeInvalid = dateFrom !== '' && dateTo !== '' && dateFrom > dateTo

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function changeStatus(value: OrderStatus | '') {
    setStatus(value)
    setPage(1)
  }

  function changeChannel(value: Channel | '') {
    setChannel(value)
    setPage(1)
  }

  function changeDateFrom(value: string) {
    setDateFrom(value)
    setPage(1)
  }

  function changeDateTo(value: string) {
    setDateTo(value)
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
    queryParams,
  }
}

import { useState } from 'react'
import { useDebouncedValue } from '@/shared/hooks'
import type { Channel } from '@/shared/types'
import type { UseClientsParams } from '../types/client.types'

const CLIENTS_PAGE_SIZE = 10

export function useClientsFilters() {
  const [search, setSearch] = useState<string>('')
  const [channel, setChannel] = useState<Channel | ''>('')
  const [tagId, setTagId] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const debouncedSearch = useDebouncedValue(search)

  const hasActiveFilters = search !== '' || channel !== '' || tagId !== ''

  function clearFilters() {
    setSearch('')
    setChannel('')
    setTagId('')
    setPage(1)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function changeChannel(value: Channel | '') {
    setChannel(value)
    setPage(1)
  }

  function changeTagId(value: string) {
    setTagId(value)
    setPage(1)
  }

  const queryParams: UseClientsParams = {
    page,
    limit: CLIENTS_PAGE_SIZE,
    search: debouncedSearch || undefined,
    channel: channel || undefined,
    tagId: tagId || undefined,
  }

  return {
    search,
    channel,
    tagId,
    page,
    setPage,
    changeSearch,
    changeChannel,
    changeTagId,
    hasActiveFilters,
    clearFilters,
    queryParams,
  }
}

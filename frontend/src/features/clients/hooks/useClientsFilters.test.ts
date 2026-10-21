import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useClientsFilters } from './useClientsFilters'

describe('useClientsFilters', () => {
  // Given the user is on page 3 of the clients list
  // When they change the channel filter
  // Then the page goes back to 1 and the channel is part of the query params
  it('resets to the first page when a filter changes', () => {
    const { result } = renderHook(() => useClientsFilters())
    act(() => result.current.setPage(3))

    act(() => result.current.changeChannel('GMAIL'))

    expect(result.current.page).toBe(1)
    expect(result.current.queryParams).toMatchObject({ page: 1, limit: 10, channel: 'GMAIL' })
  })

  // Given no filters are set
  // When reading the query params
  // Then empty filters are sent as undefined instead of empty strings
  it('omits empty filters from the query params', () => {
    const { result } = renderHook(() => useClientsFilters())

    expect(result.current.queryParams).toEqual({
      page: 1,
      limit: 10,
      search: undefined,
      channel: undefined,
      tagId: undefined,
    })
  })

  // Given no filter has been touched
  // When reading hasActiveFilters
  // Then it should be false
  it('reports no active filters by default', () => {
    const { result } = renderHook(() => useClientsFilters())
    expect(result.current.hasActiveFilters).toBe(false)
  })

  // Given any single filter is set (search, channel or tag)
  // When reading hasActiveFilters
  // Then it should be true
  it('reports an active filter as soon as one is set', () => {
    const { result } = renderHook(() => useClientsFilters())
    act(() => result.current.changeTagId('tag-1'))
    expect(result.current.hasActiveFilters).toBe(true)
  })

  // Given several filters and a non-default page are set
  // When clearFilters is called
  // Then every filter resets and the page goes back to 1
  it('resets every filter and the page on clearFilters', () => {
    const { result } = renderHook(() => useClientsFilters())
    act(() => result.current.changeSearch('laura'))
    act(() => result.current.changeChannel('GMAIL'))
    act(() => result.current.changeTagId('tag-1'))
    act(() => result.current.setPage(3))

    act(() => result.current.clearFilters())

    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.page).toBe(1)
    expect(result.current.search).toBe('')
    expect(result.current.channel).toBe('')
    expect(result.current.tagId).toBe('')
  })
})

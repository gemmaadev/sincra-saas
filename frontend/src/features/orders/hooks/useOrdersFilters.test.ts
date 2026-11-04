import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFiltersStore } from '@/shared/store'
import { useOrdersFilters } from './useOrdersFilters'

describe('useOrdersFilters', () => {
  beforeEach(() => {
    useFiltersStore.getState().clearFilters()
  })

  // Given the user is on page 3 of the orders list
  // When they change the status filter
  // Then the page goes back to 1 and the status is part of the query params
  it('resets to the first page when a filter changes', () => {
    const { result } = renderHook(() => useOrdersFilters())
    act(() => result.current.setPage(3))

    act(() => result.current.changeStatus('PENDING'))

    expect(result.current.page).toBe(1)
    expect(result.current.queryParams).toMatchObject({ page: 1, limit: 10, status: 'PENDING' })
  })

  // Given no filters are set
  // When reading the query params
  // Then empty filters are sent as undefined instead of empty strings
  it('omits empty filters from the query params', () => {
    const { result } = renderHook(() => useOrdersFilters())

    expect(result.current.queryParams).toEqual({
      page: 1,
      limit: 10,
      search: undefined,
      status: undefined,
      channel: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    })
  })

  // Given a start date later than the end date
  // When reading the query params
  // Then the invalid range should be left out instead of sent to the API
  it('leaves out an invalid date range from the query params', () => {
    const { result } = renderHook(() => useOrdersFilters())

    act(() => result.current.changeDateFrom('2026-02-01'))
    act(() => result.current.changeDateTo('2026-01-01'))

    expect(result.current.isDateRangeInvalid).toBe(true)
    expect(result.current.queryParams.dateFrom).toBeUndefined()
    expect(result.current.queryParams.dateTo).toBeUndefined()
  })

  // Given no filter has been touched
  // When reading hasActiveFilters
  // Then it should be false
  it('reports no active filters by default', () => {
    const { result } = renderHook(() => useOrdersFilters())
    expect(result.current.hasActiveFilters).toBe(false)
  })

  // Given any single filter is set (search, status, channel or a date)
  // When reading hasActiveFilters
  // Then it should be true
  it('reports an active filter as soon as one is set', () => {
    const { result } = renderHook(() => useOrdersFilters())
    act(() => result.current.changeSearch('laura'))
    expect(result.current.hasActiveFilters).toBe(true)
  })

  // Given several filters and a non-default page are set
  // When clearFilters is called
  // Then every filter resets and the page goes back to 1
  it('resets every filter and the page on clearFilters', () => {
    const { result } = renderHook(() => useOrdersFilters())
    act(() => result.current.changeSearch('laura'))
    act(() => result.current.changeStatus('PENDING'))
    act(() => result.current.changeChannel('GMAIL'))
    act(() => result.current.setPage(3))

    act(() => result.current.clearFilters())

    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.page).toBe(1)
    expect(result.current.search).toBe('')
    expect(result.current.status).toBe('')
    expect(result.current.channel).toBe('')
  })
})

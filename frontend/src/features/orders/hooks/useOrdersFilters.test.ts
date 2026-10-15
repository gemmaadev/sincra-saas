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
})

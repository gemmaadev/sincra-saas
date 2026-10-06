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
})

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useStatsFilters } from './useStatsFilters'

describe('useStatsFilters', () => {
  // Given the hook has just started
  // When its filters are read
  // Then no date range should be set and granularity should default to daily
  it('starts without a date range and daily granularity', () => {
    const { result } = renderHook(() => useStatsFilters())

    expect(result.current.filters).toEqual({
      dateFrom: undefined,
      dateTo: undefined,
      granularity: 'daily',
    })
  })

  // Given a date range
  // When it is set
  // Then it should be part of the filters
  it('exposes the chosen date range as filters', () => {
    const { result } = renderHook(() => useStatsFilters())

    act(() => {
      result.current.setDateFrom('2026-10-01')
      result.current.setDateTo('2026-10-31')
    })

    expect(result.current.filters).toEqual({
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      granularity: 'daily',
    })
  })

  // Given an end date before the start date
  // When the filters are read
  // Then the range should be flagged and neither date should be sent
  it('does not send an inverted date range', () => {
    const { result } = renderHook(() => useStatsFilters())

    act(() => {
      result.current.setDateFrom('2026-10-31')
      result.current.setDateTo('2026-10-01')
    })

    expect(result.current.isDateRangeInvalid).toBe(true)
    expect(result.current.filters.dateFrom).toBeUndefined()
    expect(result.current.filters.dateTo).toBeUndefined()
  })

  // Given the granularity switcher
  // When it is set to weekly
  // Then it should be part of the filters
  it('exposes the chosen granularity as a filter', () => {
    const { result } = renderHook(() => useStatsFilters())

    act(() => result.current.setGranularity('weekly'))

    expect(result.current.filters.granularity).toBe('weekly')
  })
})

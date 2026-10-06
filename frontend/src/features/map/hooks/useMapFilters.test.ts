import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useMapFilters } from './useMapFilters'

describe('useMapFilters', () => {
  // Given the hook has just started
  // When its filters are read
  // Then nothing should be filtered
  it('starts without any filter', () => {
    const { result } = renderHook(() => useMapFilters())

    expect(result.current.filters).toEqual({
      channel: undefined,
      from: undefined,
      to: undefined,
    })
    expect(result.current.hasActiveFilters).toBe(false)
  })

  // Given a channel and a date range
  // When they are set
  // Then they should be part of the filters sent to the map
  it('exposes the chosen channel and dates as filters', () => {
    const { result } = renderHook(() => useMapFilters())

    act(() => {
      result.current.setChannel('WHATSAPP')
      result.current.setFrom('2026-01-01')
      result.current.setTo('2026-01-31')
    })

    expect(result.current.filters).toEqual({
      channel: 'WHATSAPP',
      from: '2026-01-01',
      to: '2026-01-31',
    })
    expect(result.current.hasActiveFilters).toBe(true)
  })

  // Given an end date before the start date
  // When the filters are read
  // Then the range should be flagged and neither date should be sent
  it('does not send an inverted date range', () => {
    const { result } = renderHook(() => useMapFilters())

    act(() => {
      result.current.setFrom('2026-02-01')
      result.current.setTo('2026-01-01')
    })

    expect(result.current.isDateRangeInvalid).toBe(true)
    expect(result.current.filters.from).toBeUndefined()
    expect(result.current.filters.to).toBeUndefined()
  })

  // Given only one date is set
  // When the filters are read
  // Then the range should not be considered invalid
  it('accepts a range with only one end', () => {
    const { result } = renderHook(() => useMapFilters())

    act(() => result.current.setTo('2026-01-01'))

    expect(result.current.isDateRangeInvalid).toBe(false)
    expect(result.current.filters.to).toBe('2026-01-01')
  })

  // Given active filters
  // When they are cleared
  // Then everything should be back to empty
  it('clears every filter', () => {
    const { result } = renderHook(() => useMapFilters())
    act(() => {
      result.current.setChannel('GMAIL')
      result.current.setFrom('2026-01-01')
    })

    act(() => result.current.clearFilters())

    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.channel).toBe('')
    expect(result.current.from).toBe('')
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { getInitialRange } from './getInitialRange'

describe('getInitialRange', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // Given today is in the middle of a month
  // When getting the initial range
  // Then it should span the first to the last day of that month
  it('spans the first to the last day of the current month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-15T12:00:00'))

    const range = getInitialRange()

    expect(range.dateFrom).toBe(new Date(2026, 9, 1).toISOString())
    expect(range.dateTo).toBe(new Date(2026, 9, 31).toISOString())
  })

  // Given today is in December
  // When getting the initial range
  // Then the range should still be scoped to December, not roll over into January
  it('handles the last month of the year correctly', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-10T12:00:00'))

    const range = getInitialRange()

    expect(range.dateFrom).toBe(new Date(2026, 11, 1).toISOString())
    expect(range.dateTo).toBe(new Date(2026, 11, 31).toISOString())
  })
})

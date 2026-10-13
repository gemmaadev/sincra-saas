import { describe, it, expect } from 'vitest'
import { toAllDayExclusiveEnd } from './toAllDayExclusiveEnd'

describe('toAllDayExclusiveEnd', () => {
  // Given an event that ends partway through a day (any time after midnight)
  // When computing the exclusive end FullCalendar needs for an all-day block
  // Then it should push to the following day, so the ending day is still shown
  it('pushes to the following day when the end time is after midnight', () => {
    const result = new Date(toAllDayExclusiveEnd('2026-10-25T14:00:00'))

    expect(result.getTime()).toBe(new Date(2026, 9, 26).getTime())
  })

  // Given an event that ends exactly at midnight
  // When computing the exclusive end
  // Then that day should not be included, since the event never actually touches it
  it('keeps the same day when the end time is exactly midnight', () => {
    const result = new Date(toAllDayExclusiveEnd('2026-10-25T00:00:00'))

    expect(result.getTime()).toBe(new Date(2026, 9, 25).getTime())
  })
})

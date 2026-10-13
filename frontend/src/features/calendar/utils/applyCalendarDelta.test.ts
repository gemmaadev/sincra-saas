import { describe, it, expect } from 'vitest'
import { applyCalendarDelta } from './applyCalendarDelta'

const ZERO_DELTA = { years: 0, months: 0, days: 0, milliseconds: 0 }

describe('applyCalendarDelta', () => {
  // Given a date and a delta of whole days (a month-view drag)
  // When applying the delta
  // Then the date should move by that many days, keeping the same time of day
  it('shifts the date by whole days', () => {
    const date = new Date('2026-10-15T10:00:00')

    const result = applyCalendarDelta(date, { ...ZERO_DELTA, days: 2 })

    expect(result).toEqual(new Date('2026-10-17T10:00:00'))
  })

  // Given a date and a delta in milliseconds (a time-grid drag within the same day)
  // When applying the delta
  // Then the time should shift by that amount, keeping the same day
  it('shifts the time by milliseconds', () => {
    const date = new Date('2026-10-15T10:00:00')

    const result = applyCalendarDelta(date, { ...ZERO_DELTA, milliseconds: 60 * 60 * 1000 })

    expect(result).toEqual(new Date('2026-10-15T11:00:00'))
  })

  // Given a zero delta
  // When applying it
  // Then the date should stay exactly the same
  it('returns the same instant when the delta is zero', () => {
    const date = new Date('2026-10-15T10:00:00')

    const result = applyCalendarDelta(date, ZERO_DELTA)

    expect(result).toEqual(date)
  })
})

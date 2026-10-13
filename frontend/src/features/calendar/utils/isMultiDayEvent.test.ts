import { describe, it, expect } from 'vitest'
import { isMultiDayEvent } from './isMultiDayEvent'

describe('isMultiDayEvent', () => {
  // Given a start and end on the same day
  // When checking if the event spans multiple days
  // Then it should return false
  it('returns false when start and end are on the same day', () => {
    expect(isMultiDayEvent('2026-10-15T10:00:00', '2026-10-15T11:00:00')).toBe(false)
  })

  // Given a start and end on different days
  // When checking if the event spans multiple days
  // Then it should return true
  it('returns true when start and end are on different days', () => {
    expect(isMultiDayEvent('2026-10-22T10:00:00', '2026-10-24T13:00:00')).toBe(true)
  })

  // Given a start and end that are the exact same instant
  // When checking if the event spans multiple days
  // Then it should return false
  it('returns false when start and end are the same instant', () => {
    expect(isMultiDayEvent('2026-10-20T16:00:00', '2026-10-20T16:00:00')).toBe(false)
  })
})

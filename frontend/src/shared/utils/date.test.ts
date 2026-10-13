import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatTime, formatDateRange } from './date'

describe('formatDate', () => {
  // Given a Date
  // When formatting it
  // Then it should render as day, short month and year in Spanish
  it('formats the date as day, short month and year', () => {
    expect(formatDate(new Date('2025-04-12T10:24:00'))).toBe('12 abr 2025')
  })
})

describe('formatDateTime', () => {
  // Given a Date
  // When formatting it with time
  // Then it should render the date plus hour and minute
  it('formats the date including hour and minute', () => {
    expect(formatDateTime(new Date('2025-04-12T10:24:00'))).toBe('12 abr 2025, 10:24')
  })
})

describe('formatTime', () => {
  // Given a Date
  // When formatting only its time
  // Then it should render just the hour and minute
  it('formats only the hour and minute', () => {
    expect(formatTime(new Date('2025-04-12T10:24:00'))).toBe('10:24')
  })
})

describe('formatDateRange', () => {
  // Given a start and end on the same day
  // When formatting the range
  // Then it should show the date once, followed by both times
  it('shows the date once and both times when the range is on the same day', () => {
    const start = new Date('2026-10-15T10:00:00')
    const end = new Date('2026-10-15T11:00:00')

    expect(formatDateRange(start, end)).toBe('15 oct 2026, 10:00 – 11:00')
  })

  // Given a start and end on different days
  // When formatting the range
  // Then it should show the full date and time for both
  it('shows the full date and time for both when the range spans several days', () => {
    const start = new Date('2026-10-15T10:00:00')
    const end = new Date('2026-10-17T18:00:00')

    expect(formatDateRange(start, end)).toBe('15 oct 2026, 10:00 – 17 oct 2026, 18:00')
  })

  // Given a start and end that are the exact same instant
  // When formatting the range
  // Then it should show just that one moment, without a dash
  it('shows a single moment when start and end are the same instant', () => {
    const instant = new Date('2026-10-15T10:00:00')

    expect(formatDateRange(instant, instant)).toBe('15 oct 2026, 10:00')
  })
})

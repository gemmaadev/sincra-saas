import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from './date'

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

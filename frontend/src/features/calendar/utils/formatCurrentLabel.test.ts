import { describe, it, expect } from 'vitest'
import { formatCurrentLabel } from './formatCurrentLabel'

describe('formatCurrentLabel', () => {
  // Given a date
  // When formatting it as the current period label
  // Then it should render the month and year in Spanish, with the month capitalized
  it('formats the month and year, capitalized', () => {
    expect(formatCurrentLabel(new Date(2026, 9, 15))).toBe('Octubre de 2026')
  })
})

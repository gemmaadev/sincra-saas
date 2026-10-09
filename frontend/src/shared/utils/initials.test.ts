import { describe, it, expect } from 'vitest'
import { getInitials } from './initials'

describe('getInitials', () => {
  // Given a name with two words
  // When the initials are computed
  // Then it should take the first letter of each, uppercase
  it('takes the first letter of the first two words', () => {
    expect(getInitials('Laura Martínez')).toBe('LM')
  })

  // Given a name with only one word
  // When the initials are computed
  // Then it should use just that letter
  it('uses a single letter for a one-word name', () => {
    expect(getInitials('Laura')).toBe('L')
  })

  // Given a name with more than two words
  // When the initials are computed
  // Then only the first two should count
  it('ignores words after the second one', () => {
    expect(getInitials('Laura Martínez García')).toBe('LM')
  })
})

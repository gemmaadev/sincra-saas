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

  // Given a client name that includes the business in parentheses
  // When the initials are computed
  // Then punctuation is ignored and the first two real words are used
  it('ignores parentheses and takes the first letter of the first two words', () => {
    expect(getInitials('Anna (Restaurant Can Vila)')).toBe('AR')
    expect(getInitials('Laura Puig (Fruites Puig)')).toBe('LP')
  })

  // Given a name that separates the person and the business with a dash
  // When the initials are computed
  // Then the dash is not treated as a letter
  it('ignores dashes and other punctuation between words', () => {
    expect(getInitials('Anna - Restaurant Can Vila')).toBe('AR')
    expect(getInitials('  Anna   (Restaurant)  ')).toBe('AR')
  })

  // Given a name with accents
  // When the initials are computed
  // Then the accented letters are kept and uppercased
  it('keeps accented letters', () => {
    expect(getInitials('ángel núñez')).toBe('ÁN')
    expect(getInitials('Ñoño Álvarez')).toBe('ÑÁ')
  })

  // Given a name with no letters or digits
  // When the initials are computed
  // Then it should be empty instead of showing the punctuation
  it('returns nothing when the name has no letters or digits', () => {
    expect(getInitials('---')).toBe('')
    expect(getInitials('')).toBe('')
  })
})

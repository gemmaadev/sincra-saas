import { describe, it, expect } from 'vitest'
import { emptyToNull } from './emptyToNull'

describe('emptyToNull', () => {
  // Given a blank or whitespace-only string
  // When converting it
  // Then it should return null
  it('returns null for an empty or whitespace-only string', () => {
    expect(emptyToNull('')).toBeNull()
    expect(emptyToNull('   ')).toBeNull()
  })

  // Given a string with content, possibly padded with whitespace
  // When converting it
  // Then it should return the trimmed string
  it('returns the trimmed string when it has content', () => {
    expect(emptyToNull('  Barcelona  ')).toBe('Barcelona')
  })
})

import { describe, it, expect } from 'vitest'
import { EMAIL_PATTERN, PHONE_PATTERN } from './validation'

describe('EMAIL_PATTERN', () => {
  // Given well-formed emails
  // When tested against the pattern
  // Then they should match
  it.each(['laura@ejemplo.com', 'a.b+c@sub.dominio.es'])('accepts %s', (email) => {
    expect(EMAIL_PATTERN.test(email)).toBe(true)
  })

  // Given malformed emails
  // When tested against the pattern
  // Then they should not match
  it.each(['laura', 'laura@', 'laura@ejemplo', 'la ura@ejemplo.com', '@ejemplo.com'])(
    'rejects %s',
    (email) => {
      expect(EMAIL_PATTERN.test(email)).toBe(false)
    },
  )
})

describe('PHONE_PATTERN', () => {
  // Given phone numbers with or without prefix and spaces
  // When tested against the pattern
  // Then they should match
  it.each(['612345678', '+34 612 34 56 78', '+447911123456'])('accepts %s', (phone) => {
    expect(PHONE_PATTERN.test(phone)).toBe(true)
  })

  // Given values that are not phone numbers
  // When tested against the pattern
  // Then they should not match
  it.each(['abc', '12345', '612-345-678', 'telefono 612345678'])('rejects %s', (phone) => {
    expect(PHONE_PATTERN.test(phone)).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { connectedAccountLabel } from './connectedAccountLabel'

describe('connectedAccountLabel', () => {
  // Given an email with spaces and capitals
  // When the connected-account label is built
  // Then it reads "Conectado como" plus the lowercase email
  it('shows the email trimmed and in lowercase', () => {
    expect(connectedAccountLabel('  SincraManager@Outlook.es ')).toBe(
      'Conectado como sincramanager@outlook.es',
    )
  })

  // Given no email, or only spaces
  // When the label is built
  // Then there is no status text
  it('returns nothing when the email is missing', () => {
    expect(connectedAccountLabel(null)).toBeNull()
    expect(connectedAccountLabel(undefined)).toBeNull()
    expect(connectedAccountLabel('   ')).toBeNull()
  })
})

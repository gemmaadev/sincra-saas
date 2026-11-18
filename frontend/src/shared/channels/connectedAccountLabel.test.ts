import { describe, it, expect } from 'vitest'
import { connectedAccountLabel } from './connectedAccountLabel'

describe('connectedAccountLabel', () => {
  it('shows the email trimmed and in lowercase', () => {
    expect(connectedAccountLabel('  SincraManager@Outlook.es ')).toBe(
      'Conectado como sincramanager@outlook.es',
    )
  })

  it('returns nothing when the email is missing', () => {
    expect(connectedAccountLabel(null)).toBeNull()
    expect(connectedAccountLabel(undefined)).toBeNull()
    expect(connectedAccountLabel('   ')).toBeNull()
  })
})

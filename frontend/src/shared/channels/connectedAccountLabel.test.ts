import { describe, it, expect } from 'vitest'
import { connectedAccountLabel } from './connectedAccountLabel'

describe('connectedAccountLabel', () => {
  it('shows the email trimmed and in lowercase', () => {
    expect(connectedAccountLabel('  SincraManager@Outlook.es ')).toBe(
      'Conectado como sincramanager@outlook.es',
    )
  })

  it('falls back when the email is missing', () => {
    expect(connectedAccountLabel(null)).toBe('Cuenta conectada')
    expect(connectedAccountLabel(undefined)).toBe('Cuenta conectada')
    expect(connectedAccountLabel('   ')).toBe('Cuenta conectada')
  })
})

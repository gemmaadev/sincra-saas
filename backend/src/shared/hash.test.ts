import { describe, it, expect } from 'vitest'
import { hashPassword, comparePassword } from './hash'

describe('hash', () => {
  it('produces a hash that verifies against the original password', async () => {
    const hash = await hashPassword('mi-contraseña-123')
    await expect(comparePassword('mi-contraseña-123', hash)).resolves.toBe(true)
  })

  it('rejects a wrong password against a valid hash', async () => {
    const hash = await hashPassword('mi-contraseña-123')
    await expect(comparePassword('otra-contraseña', hash)).resolves.toBe(false)
  })

  it('produces different hashes for the same password (random salt)', async () => {
    const hash1 = await hashPassword('misma-contraseña')
    const hash2 = await hashPassword('misma-contraseña')
    expect(hash1).not.toBe(hash2)
  })

  it('never stores the plain password inside the hash', async () => {
    const hash = await hashPassword('no-deberias-verme')
    expect(hash).not.toContain('no-deberias-verme')
  })

  it('hashes with a cost factor of 12', async () => {
    const hash = await hashPassword('mi-contraseña-123')
    expect(hash).toMatch(/^\$2[aby]\$12\$/)
  })
})

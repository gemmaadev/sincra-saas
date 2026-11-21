import { describe, it, expect } from 'vitest'
import { gmailAccountNotice } from './gmailAccountNotice'

describe('gmailAccountNotice', () => {
  // Given Google verified a different address than the one typed
  // When the notice is built
  // Then it names the account that was actually connected
  it('names the verified account when it differs from the typed email', () => {
    expect(gmailAccountNotice('  Tienda@Gmail.com ', 'otra@gmail.com')).toBe(
      'El email escrito no coincide. Se ha conectado otra@gmail.com.',
    )
  })

  // Given the typed email and the verified one are the same, or one is missing
  // When the notice is built
  // Then there is nothing to show
  it('stays quiet when the emails match or one is missing', () => {
    expect(gmailAccountNotice('tienda@gmail.com', '  Tienda@Gmail.com ')).toBeNull()
    expect(gmailAccountNotice(null, 'tienda@gmail.com')).toBeNull()
    expect(gmailAccountNotice('tienda@gmail.com', null)).toBeNull()
  })
})

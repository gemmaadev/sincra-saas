import { describe, expect, it } from 'vitest'
import { toPathAfterBusinessSwitch } from './toPathAfterBusinessSwitch'

describe('toPathAfterBusinessSwitch', () => {
  // Given a detail URL of the business that is being left
  // When choosing where to land
  // Then it should drop the record id and stay on that section
  it('drops the record id from a detail URL', () => {
    expect(toPathAfterBusinessSwitch('/clients/client-1')).toBe('/clients')
    expect(toPathAfterBusinessSwitch('/orders/order-9')).toBe('/orders')
  })

  // Given a section that is already a list
  // When choosing where to land
  // Then it should stay on that section
  it('keeps a section list', () => {
    expect(toPathAfterBusinessSwitch('/stats')).toBe('/stats')
    expect(toPathAfterBusinessSwitch('/settings')).toBe('/settings')
  })

  // Given a path that is not an app section
  // When choosing where to land
  // Then it should fall back to stats
  it('falls back to stats for an unknown path', () => {
    expect(toPathAfterBusinessSwitch('/')).toBe('/stats')
    expect(toPathAfterBusinessSwitch('/login')).toBe('/stats')
  })
})

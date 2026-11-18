import { describe, expect, it } from 'vitest'
import { routeAfterBusinessSwitch } from './routeAfterBusinessSwitch'

describe('routeAfterBusinessSwitch', () => {
  // Given a detail URL of the business that is being left
  // When choosing where to land
  // Then it should drop the record id and stay on that section
  it('drops the record id from a detail URL', () => {
    expect(routeAfterBusinessSwitch('/clients/client-1')).toBe('/clients')
    expect(routeAfterBusinessSwitch('/orders/order-9')).toBe('/orders')
  })

  // Given a section that is already a list
  // When choosing where to land
  // Then it should stay on that section
  it('keeps a section list', () => {
    expect(routeAfterBusinessSwitch('/stats')).toBe('/stats')
    expect(routeAfterBusinessSwitch('/settings')).toBe('/settings')
  })

  // Given a path that is not an app section
  // When choosing where to land
  // Then it should fall back to stats
  it('falls back to stats for an unknown path', () => {
    expect(routeAfterBusinessSwitch('/')).toBe('/stats')
    expect(routeAfterBusinessSwitch('/login')).toBe('/stats')
  })
})

import { describe, expect, it } from 'vitest'
import { canCancelOrder, lastOperationalStatus } from './operationalStatus'

describe('lastOperationalStatus', () => {
  // Given an order moving through the normal steps
  // When asking where it is in that flow
  // Then the answer is its current status
  it('returns the current status while the order is in the normal flow', () => {
    expect(lastOperationalStatus('PREPARING', [])).toBe('PREPARING')
  })

  // Given an incident marked after the order was being prepared
  // When asking where it paused
  // Then the answer is En preparación, not the incident itself
  it('looks past the incident to the last delivery step', () => {
    expect(
      lastOperationalStatus('INCIDENT', [
        { status: 'PENDING' },
        { status: 'PREPARING' },
        { status: 'INCIDENT' },
      ]),
    ).toBe('PREPARING')
  })

  // Given no earlier step was recorded
  // When the order is an incident
  // Then it falls back to Pedido recibido
  it('falls back to PENDING when the history has no delivery step', () => {
    expect(lastOperationalStatus('INCIDENT', [{ status: 'INCIDENT' }])).toBe('PENDING')
  })
})

describe('canCancelOrder', () => {
  it('allows cancelling an order that is still being prepared', () => {
    expect(canCancelOrder('PREPARING', [{ status: 'PREPARING' }])).toBe(true)
  })

  it('blocks cancelling a delivered order, including one that now has an incident', () => {
    expect(canCancelOrder('DELIVERED', [{ status: 'DELIVERED' }])).toBe(false)
    expect(canCancelOrder('INCIDENT', [{ status: 'DELIVERED' }, { status: 'INCIDENT' }])).toBe(
      false,
    )
  })

  it('blocks cancelling an order that is already cancelled', () => {
    expect(canCancelOrder('CANCELLED', [{ status: 'PREPARING' }, { status: 'CANCELLED' }])).toBe(
      false,
    )
  })
})

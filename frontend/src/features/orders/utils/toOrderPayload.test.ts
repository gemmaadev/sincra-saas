import { describe, it, expect } from 'vitest'
import { toOrderPayload } from './toOrderPayload'
import type { OrderFormValues } from '../types/order.types'

const filledValues: OrderFormValues = {
  clientId: 'client-1',
  clientName: 'Laura García',
  items: [{ product: '  Camiseta  ', description: '  Talla M  ', quantity: 2, unitPrice: 15 }],
  zone: 'Barcelona',
  address: 'Carrer Major 1',
  expectedDate: '2026-11-01',
}

describe('toOrderPayload', () => {
  // Given item fields with surrounding spaces
  // When they are converted to a payload
  // Then the product and description should be trimmed
  it('trims the item text fields', () => {
    const payload = toOrderPayload(filledValues)

    expect(payload.items).toEqual([
      { product: 'Camiseta', description: 'Talla M', quantity: 2, unitPrice: 15 },
    ])
  })

  // Given an item with no description
  // When it is converted to a payload
  // Then the description should be null, not an empty string
  it('sends an empty item description as null', () => {
    const payload = toOrderPayload({
      ...filledValues,
      items: [{ product: 'Camiseta', description: '   ', quantity: 1, unitPrice: 15 }],
    })

    expect(payload.items[0]?.description).toBeNull()
  })

  // Given optional order fields left empty or with only spaces
  // When they are converted to a payload
  // Then they should be null, not empty strings
  it('sends empty optional fields as null', () => {
    const payload = toOrderPayload({
      ...filledValues,
      zone: '',
      address: '   ',
      expectedDate: '',
    })

    expect(payload).toMatchObject({ zone: null, address: null, expectedDate: null })
  })

  // Given a filled form
  // When it is converted to a payload
  // Then the client id should be carried over as-is
  it('carries the client id over', () => {
    expect(toOrderPayload(filledValues)).toMatchObject({ clientId: 'client-1' })
  })
})

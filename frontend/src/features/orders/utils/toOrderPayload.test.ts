import { describe, it, expect } from 'vitest'
import { toOrderPayload } from './toOrderPayload'
import type { OrderFormValues } from '../types/order.types'

const filledValues: OrderFormValues = {
  clientId: 'client-1',
  clientName: 'Laura García',
  items: [{ product: '  Camiseta  ', description: '  Talla M  ', quantity: 2, unitPrice: 15 }],
  channel: 'WHATSAPP',
  zone: 'Barcelona',
  address: 'Carrer Major 1',
  expectedDate: '2026-11-01',
  description: 'Entregar en portería',
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
      description: '',
    })

    expect(payload).toMatchObject({
      zone: null,
      address: null,
      expectedDate: null,
      description: null,
    })
  })

  // Given a custom description
  // When it is converted to a payload
  // Then it should be carried over as-is
  it('carries the description over', () => {
    expect(toOrderPayload(filledValues)).toMatchObject({ description: 'Entregar en portería' })
  })

  // Given no channel picked (the Select's placeholder option)
  // When the form is converted to a payload
  // Then the channel should be null, not an empty string
  it('sends an unpicked channel as null', () => {
    const payload = toOrderPayload({ ...filledValues, channel: '' })

    expect(payload.channel).toBeNull()
  })

  // Given a channel picked
  // When the form is converted to a payload
  // Then it should be carried over as-is
  it('carries the picked channel over', () => {
    expect(toOrderPayload(filledValues)).toMatchObject({ channel: 'WHATSAPP' })
  })

  // Given a filled form
  // When it is converted to a payload
  // Then the client id should be carried over as-is
  it('carries the client id over', () => {
    expect(toOrderPayload(filledValues)).toMatchObject({ clientId: 'client-1' })
  })

  // Given form values that carry the location chosen on the map
  // When they are converted to a payload
  // Then the coordinates should be included
  it('includes the coordinates when the form has them', () => {
    const payload = toOrderPayload({ ...filledValues, latitude: 41.7288, longitude: 1.8286 })

    expect(payload).toMatchObject({ latitude: 41.7288, longitude: 1.8286 })
  })

  // Given form values without coordinates
  // When they are converted to a payload
  // Then the payload should not even have the coordinate keys
  it('omits the coordinates when the form has none', () => {
    const payload = toOrderPayload(filledValues)

    expect(payload).not.toHaveProperty('latitude')
    expect(payload).not.toHaveProperty('longitude')
  })
})

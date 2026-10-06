import { describe, it, expect } from 'vitest'
import { toClientPayload } from './toClientPayload'
import type { ClientFormValues } from '../types/client.types'

const filledValues: ClientFormValues = {
  name: '  Laura García ',
  email: ' laura@ejemplo.test ',
  phone: '+34 612 34 56 78',
  channels: ['GMAIL'],
  type: 'particular',
  zone: 'Barcelona',
  address: 'Carrer Major 1',
}

describe('toClientPayload', () => {
  // Given form values that carry the location chosen on the map
  // When they are converted to a payload
  // Then the coordinates should be included
  it('includes the coordinates when the form has them', () => {
    const payload = toClientPayload({ ...filledValues, latitude: 41.7288, longitude: 1.8286 })

    expect(payload).toMatchObject({ latitude: 41.7288, longitude: 1.8286 })
  })

  // Given form values without coordinates
  // When they are converted to a payload
  // Then the payload should not even have the coordinate keys
  it('omits the coordinates when the form has none', () => {
    const payload = toClientPayload(filledValues)

    expect(payload).not.toHaveProperty('latitude')
    expect(payload).not.toHaveProperty('longitude')
  })

  // Given form values with surrounding spaces
  // When they are converted to a payload
  // Then the text fields should be trimmed
  it('trims the text fields', () => {
    expect(toClientPayload(filledValues)).toEqual({
      name: 'Laura García',
      email: 'laura@ejemplo.test',
      phone: '+34 612 34 56 78',
      channels: ['GMAIL'],
      type: 'particular',
      zone: 'Barcelona',
      address: 'Carrer Major 1',
    })
  })

  // Given optional fields left empty or with only spaces
  // When they are converted to a payload
  // Then they should be null, not empty strings (empty emails would collide on the unique index)
  it('sends empty optional fields as null', () => {
    const payload = toClientPayload({
      ...filledValues,
      email: '',
      phone: '   ',
      type: '',
      zone: '',
      address: '',
    })

    expect(payload).toMatchObject({
      email: null,
      phone: null,
      type: null,
      zone: null,
      address: null,
    })
  })
})

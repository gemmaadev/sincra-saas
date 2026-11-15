import { describe, it, expect } from 'vitest'
import { toOrderFormValues } from './toOrderFormValues'
import type { OrderDetail } from '../types/order.types'

const order: OrderDetail = {
  id: 'order-1',
  number: 7,
  status: 'PENDING',
  channel: null,
  kind: 'PRODUCT',
  price: null,
  address: null,
  zone: null,
  expectedDate: null,
  description: null,
  client: { id: 'client-1', name: 'Laura García', email: null, phone: null, channels: [] },
  items: [
    { id: 'item-1', product: 'Camiseta', description: null, quantity: 2, unitPrice: '15.00' },
    { id: 'item-2', product: 'Pañuelo', description: null, quantity: 1, unitPrice: null },
  ],
  statusHistory: [],
  orderTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('toOrderFormValues', () => {
  // Given an order with one priced line and one line without a price
  // When it is converted into form values
  // Then the priced line keeps its amount and the other stays empty
  it('keeps a missing line price empty', () => {
    const values = toOrderFormValues(order)

    expect(values.items.map((item) => item.unitPrice)).toEqual([15, null])
  })

  // Given no order
  // When the empty form values are built
  // Then the first line should start without a price
  it('starts a new line without a price', () => {
    const values = toOrderFormValues()

    expect(values.items).toEqual([{ product: '', description: '', quantity: 1, unitPrice: null }])
  })
})

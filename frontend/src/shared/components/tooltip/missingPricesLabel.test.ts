import { describe, it, expect } from 'vitest'
import { missingPricesLabel } from './missingPricesLabel'

describe('missingPricesLabel', () => {
  // Given one order without a price
  // When the tooltip label is built
  // Then it should use the singular
  it('uses the singular for one order', () => {
    expect(missingPricesLabel(1)).toBe('Falta el precio en 1 pedido')
  })

  // Given several orders without a price
  // When the tooltip label is built
  // Then it should say how many prices are missing
  it('counts several orders that lack a price', () => {
    expect(missingPricesLabel(2)).toBe('Faltan precios en 2 pedidos')
  })
})

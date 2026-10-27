import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OrderItemsList } from './OrderItemsList'
import type { OrderItem } from '../../types/order.types'

const mockItems: OrderItem[] = [
  { id: 'item-1', product: 'Chaqueta oversize', description: 'Talla M - Beige', quantity: 1, unitPrice: '89.90' },
  { id: 'item-2', product: 'Bolso de piel', description: null, quantity: 2, unitPrice: '25.00' },
]

describe('OrderItemsList', () => {
  // Given a list of items, one with a description and one without
  // When the list is rendered
  // Then each item should show its product, price and quantity, and the description when it has one
  it('shows each item with its product, price and quantity', () => {
    render(<OrderItemsList items={mockItems} />)

    expect(screen.getByText('Chaqueta oversize')).toBeInTheDocument()
    expect(screen.getByText('Talla M - Beige')).toBeInTheDocument()
    expect(screen.getByText('89,90 €')).toBeInTheDocument()
    expect(screen.getByText('x1')).toBeInTheDocument()

    expect(screen.getByText('Bolso de piel')).toBeInTheDocument()
    expect(screen.getByText('25,00 €')).toBeInTheDocument()
    expect(screen.getByText('x2')).toBeInTheDocument()
  })

  // Given no items
  // When the list is rendered
  // Then it should show a message instead of an empty list
  it('shows a message when there are no items', () => {
    render(<OrderItemsList items={[]} />)

    expect(screen.getByText('Este pedido no tiene productos.')).toBeInTheDocument()
  })
})

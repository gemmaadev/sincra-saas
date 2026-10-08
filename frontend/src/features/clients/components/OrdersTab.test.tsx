import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OrdersTab } from './OrdersTab'
import type { ClientDetail } from '../types/client.types'

const mockClient: ClientDetail = {
  id: 'client-1',
  name: 'Laura García',
  email: null,
  phone: null,
  channels: [],
  type: null,
  address: null,
  zone: null,
  latitude: null,
  longitude: null,
  lastContact: null,
  clientTags: [],
  orders: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('OrdersTab', () => {
  // Given a client with no orders
  // When OrdersTab is rendered
  // Then it should explain there are none yet, not show an empty list
  it('shows an empty message when the client has no orders', () => {
    render(<OrdersTab client={mockClient} />)
    expect(screen.getByText('Todavía no hay pedidos para este cliente.')).toBeInTheDocument()
  })

  // Given a client with orders
  // When OrdersTab is rendered
  // Then each order's number, description, status and price should be shown
  it('shows the number, description, status and price of each order', () => {
    render(
      <OrdersTab
        client={{
          ...mockClient,
          orders: [
            {
              id: 'order-1',
              number: 42,
              status: 'DELIVERED',
              kind: 'PRODUCT',
              channel: 'WHATSAPP',
              price: '89.90',
              expectedDate: null,
              createdAt: '2026-10-07T10:16:33.000Z',
              description: 'Chaqueta oversize x2, Bolso de piel',
            },
          ],
        }}
      />,
    )

    expect(screen.getByText('#42')).toBeInTheDocument()
    expect(screen.getByText('Chaqueta oversize x2, Bolso de piel')).toBeInTheDocument()
    expect(screen.getByText('Entregado')).toBeInTheDocument()
    expect(screen.getByText('89,90 €')).toBeInTheDocument()
  })
})

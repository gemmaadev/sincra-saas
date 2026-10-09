import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OrderPopupCard } from './OrderPopupCard'
import type { MapOrder } from '../types/map.types'

const mockOrder: MapOrder = {
  id: 'order-1',
  number: 7,
  status: 'SHIPPED',
  channel: 'WHATSAPP',
  price: '50',
  zone: 'Manresa',
  clientName: 'Laura Martínez',
  latitude: 41.7,
  longitude: 1.8,
  approximate: false,
}

function renderCard(order: MapOrder = mockOrder) {
  render(<OrderPopupCard order={order} />)
}

describe('OrderPopupCard', () => {
  // Given an order with a status, channel, zone, client and price
  // When the card is rendered
  // Then it should show all of them
  it('shows the order details', () => {
    renderCard()

    expect(screen.getByText('Pedido #7')).toBeInTheDocument()
    expect(screen.getByText('Enviado')).toBeInTheDocument()
    expect(screen.getByText('Laura Martínez')).toBeInTheDocument()
    expect(screen.getByText('Manresa')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('50,00 €')).toBeInTheDocument()
  })

  // Given an order with no channel
  // When the card is rendered
  // Then the channel row should be omitted
  it('omits the channel row when the order has none', () => {
    renderCard({ ...mockOrder, channel: null })

    expect(screen.queryByText('Canal:')).not.toBeInTheDocument()
  })

  // Given an order without its own zone
  // When the card is rendered
  // Then it should show the fallback zone label
  it('shows the fallback zone when the order has none', () => {
    renderCard({ ...mockOrder, zone: null })

    expect(screen.getByText('Sin zona')).toBeInTheDocument()
  })

  // Given an order placed at its client's location
  // When the card is rendered
  // Then it should warn that the location is approximate
  it('warns when the location is approximate', () => {
    renderCard({ ...mockOrder, approximate: true })

    expect(screen.getByText(/Ubicación aproximada/)).toBeInTheDocument()
  })

  // Given an order with its own exact location
  // When the card is rendered
  // Then there should be no approximate warning
  it('does not warn when the location is exact', () => {
    renderCard()

    expect(screen.queryByText(/Ubicación aproximada/)).not.toBeInTheDocument()
  })
})

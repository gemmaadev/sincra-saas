import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OrderSummaryTab } from './OrderSummaryTab'
import type { OrderDetail } from '../../types/order.types'

const mockOrder: OrderDetail = {
  id: 'order-1',
  number: 7,
  status: 'PENDING',
  channel: 'WHATSAPP',
  kind: 'PRODUCT',
  price: '50.00',
  address: null,
  zone: null,
  expectedDate: null,
  description: null,
  client: { id: 'client-1', name: 'Laura García', email: null, phone: null, channels: [] },
  items: [],
  statusHistory: [],
  orderTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderOrderSummaryTab(order: OrderDetail) {
  return render(<OrderSummaryTab order={order} />)
}

describe('OrderSummaryTab', () => {
  // Given an order with a channel
  // When the tab is rendered
  // Then it should show that channel's icon as "Canal de origen"
  // (the client's own identity — name/email/phone/channels — lives in OrderDetailPanel's
  // header now, not duplicated here; see OrderDetailPanel.test.tsx for that coverage)
  it("shows the order's channel", () => {
    renderOrderSummaryTab(mockOrder)

    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
  })

  // Given an order with a status
  // When the tab is rendered
  // Then its status should be shown as a badge
  it('shows the order status', () => {
    renderOrderSummaryTab({ ...mockOrder, status: 'SHIPPED' })

    expect(screen.getByText('Enviado')).toBeInTheDocument()
  })

  // Given an order with items
  // When the tab is rendered
  // Then the products section should list them
  it('shows the order items', () => {
    renderOrderSummaryTab({
      ...mockOrder,
      items: [{ id: 'item-1', product: 'Camiseta', description: null, quantity: 1, unitPrice: '15.00' }],
    })

    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('Camiseta')).toBeInTheDocument()
  })

  // Given an order without an address or zone
  // When the tab is rendered
  // Then the location should show a fallback dash
  it('shows a fallback dash when there is no location', () => {
    renderOrderSummaryTab(mockOrder)

    expect(screen.getByText('Ubicación').nextSibling).toHaveTextContent('—')
  })

  // Given an order with its own address and zone
  // When the tab is rendered
  // Then the location should combine both
  it('combines the address and zone into the location', () => {
    renderOrderSummaryTab({ ...mockOrder, address: 'Carrer Major 1', zone: 'Sabadell' })

    expect(screen.getByText('Carrer Major 1, Sabadell')).toBeInTheDocument()
  })

  // Given an order with a description
  // When the tab is rendered
  // Then it should be shown in its own card
  it('shows the description when it has one', () => {
    renderOrderSummaryTab({ ...mockOrder, description: 'Camiseta x2' })

    expect(screen.getByText('Camiseta x2')).toBeInTheDocument()
  })

  // Given an order without a description
  // When the tab is rendered
  // Then the description card should be omitted
  it('omits the description card when there is none', () => {
    renderOrderSummaryTab(mockOrder)

    expect(screen.queryByText('Descripción')).not.toBeInTheDocument()
  })

  // Given an order with no expected date
  // When the tab is rendered
  // Then it should show a fallback dash
  it('shows a fallback dash when there is no expected date', () => {
    renderOrderSummaryTab(mockOrder)

    expect(screen.getByText('Fecha prevista').nextSibling).toHaveTextContent('—')
  })
})

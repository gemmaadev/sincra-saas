import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MantineProvider } from '@mantine/core'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
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
  const onEdit = vi.fn()
  const onCancel = vi.fn()
  const onDelete = vi.fn()
  render(
    <MantineProvider>
      <MemoryRouter>
        <OrderPopupCard order={order} onEdit={onEdit} onCancel={onCancel} onDelete={onDelete} />
      </MemoryRouter>
    </MantineProvider>,
  )
  return { onEdit, onCancel, onDelete, user: userEvent.setup() }
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

  // Given the card is open
  // When the user clicks the edit button
  // Then onEdit should be called
  it('calls onEdit from the edit button', async () => {
    const { onEdit, user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar pedido' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  // Given the card is open
  // When the user clicks the cancel button
  // Then onCancel should be called
  it('calls onCancel from the cancel button', async () => {
    const { onCancel, user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Cancelar pedido' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  // Given an order that is already DELIVERED
  // When the card is rendered
  // Then the cancel button should be disabled
  it('disables the cancel button for a DELIVERED order', () => {
    renderCard({ ...mockOrder, status: 'DELIVERED' })

    expect(screen.getByRole('button', { name: 'Cancelar pedido' })).toBeDisabled()
  })

  // Given the card is open
  // When the user clicks the delete button
  // Then onDelete should be called
  it('calls onDelete from the delete button', async () => {
    const { onDelete, user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Eliminar pedido' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  // Given any order
  // When the card is rendered
  // Then "Ver pedido" should link to the order detail
  it('links to the order detail', () => {
    renderCard()

    expect(screen.getByRole('link', { name: /Ver pedido/ })).toHaveAttribute(
      'href',
      '/orders/order-1',
    )
  })
})

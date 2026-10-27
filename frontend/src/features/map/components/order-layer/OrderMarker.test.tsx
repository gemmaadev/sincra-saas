import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MapContainer } from 'react-leaflet'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { stubMapSize, waitOutDoubleClickWindow } from '@/shared/test/leaflet'
import { OrderMarker } from './OrderMarker'
import type { MapOrder } from '../../types/map.types'

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

function renderMarker(order: MapOrder = mockOrder) {
  const onEdit = vi.fn()
  const onCancel = vi.fn()
  const onDelete = vi.fn()
  render(
    <MantineProvider>
      <MemoryRouter>
        <MapContainer center={[41.7, 1.8]} zoom={10}>
          <OrderMarker order={order} onEdit={onEdit} onCancel={onCancel} onDelete={onDelete} />
        </MapContainer>
      </MemoryRouter>
    </MantineProvider>,
  )
  return { onEdit, onCancel, onDelete, user: userEvent.setup() }
}

describe('OrderMarker', () => {
  beforeEach(() => {
    stubMapSize()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Given an order with a location
  // When the marker is rendered inside a map
  // Then a marker named after the order number should be drawn
  it('draws a marker named after the order number', () => {
    renderMarker()

    expect(screen.getByTitle('Pedido #7')).toBeInTheDocument()
  })

  // Given an order numbered 7
  // When the marker is rendered
  // Then it should show "#7" instead of the client's initials
  it('shows the order number on the marker', () => {
    renderMarker()

    expect(screen.getByText('#7')).toBeInTheDocument()
  })

  // Given a drawn marker
  // When the user clicks it
  // Then the popup with the order details should open
  it('opens the popup card when the marker is clicked', async () => {
    const { user } = renderMarker()

    await user.click(screen.getByTitle('Pedido #7'))

    expect(await screen.findByText('Laura Martínez')).toBeInTheDocument()
  })

  // Given the popup card is open
  // When the user clicks "Editar pedido"
  // Then onEdit should be called with the order
  it('calls onEdit with the order from the card', async () => {
    const { onEdit, user } = renderMarker()

    await user.click(screen.getByTitle('Pedido #7'))
    const editButton = await screen.findByRole('button', { name: 'Editar pedido' })
    await waitOutDoubleClickWindow()
    await user.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(mockOrder)
  })

  // Given the popup card is open
  // When the user clicks "Cancelar pedido"
  // Then onCancel should be called with the order
  it('calls onCancel with the order from the card', async () => {
    const { onCancel, user } = renderMarker()

    await user.click(screen.getByTitle('Pedido #7'))
    const cancelButton = await screen.findByRole('button', { name: 'Cancelar pedido' })
    await waitOutDoubleClickWindow()
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalledWith(mockOrder)
  })

  // Given the popup card is open
  // When the user clicks "Eliminar pedido"
  // Then onDelete should be called with the order
  it('calls onDelete with the order from the card', async () => {
    const { onDelete, user } = renderMarker()

    await user.click(screen.getByTitle('Pedido #7'))
    const deleteButton = await screen.findByRole('button', { name: 'Eliminar pedido' })
    await waitOutDoubleClickWindow()
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(mockOrder)
  })
})

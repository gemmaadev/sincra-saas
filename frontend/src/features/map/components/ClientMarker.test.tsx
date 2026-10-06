import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MapContainer } from 'react-leaflet'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ClientMarker } from './ClientMarker'
import type { MapClient } from '../types/map.types'

const mockClient: MapClient = {
  id: 'client-1',
  name: 'Laura Martínez',
  latitude: 41.7,
  longitude: 1.8,
  zone: 'Manresa',
  channels: ['WHATSAPP'],
  type: 'Panadería',
  approximate: false,
}

const LEAFLET_DOUBLE_CLICK_WINDOW_MS = 250

function waitOutDoubleClickWindow() {
  return new Promise((resolve) => setTimeout(resolve, LEAFLET_DOUBLE_CLICK_WINDOW_MS))
}

function renderMarker() {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(
    <MemoryRouter>
      <MapContainer center={[41.7, 1.8]} zoom={10}>
        <ClientMarker client={mockClient} onEdit={onEdit} onDelete={onDelete} />
      </MapContainer>
    </MemoryRouter>,
  )
  return { onEdit, onDelete, user: userEvent.setup() }
}

describe('ClientMarker', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Given a client with a location
  // When the marker is rendered inside a map
  // Then a marker named after the client should be drawn
  it('draws a marker named after the client', () => {
    renderMarker()

    expect(screen.getByTitle('Laura Martínez')).toBeInTheDocument()
  })

  // Given a drawn marker
  // When the user clicks it
  // Then the preview card of the client should open
  it('opens the preview card when the marker is clicked', async () => {
    const { user } = renderMarker()

    await user.click(screen.getByTitle('Laura Martínez'))

    expect(await screen.findByRole('link', { name: /Ver cliente/ })).toHaveAttribute(
      'href',
      '/clients/client-1',
    )
  })

  // Given the preview card is open
  // When the user clicks "Editar cliente"
  // Then onEdit should be called with the client
  it('calls onEdit with the client from the card', async () => {
    const { onEdit, user } = renderMarker()

    await user.click(screen.getByTitle('Laura Martínez'))
    const editButton = await screen.findByRole('button', { name: 'Editar cliente' })
    await waitOutDoubleClickWindow()
    await user.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(mockClient)
  })

  // Given the preview card is open
  // When the user clicks "Eliminar cliente"
  // Then onDelete should be called with the client
  it('calls onDelete with the client from the card', async () => {
    const { onDelete, user } = renderMarker()

    await user.click(screen.getByTitle('Laura Martínez'))
    const deleteButton = await screen.findByRole('button', { name: 'Eliminar cliente' })
    await waitOutDoubleClickWindow()
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(mockClient)
  })
})

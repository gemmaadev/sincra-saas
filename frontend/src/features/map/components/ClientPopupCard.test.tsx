import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ClientPopupCard } from './ClientPopupCard'
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

function renderCard(client: MapClient = mockClient) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(
    <MemoryRouter>
      <ClientPopupCard client={client} onEdit={onEdit} onDelete={onDelete} />
    </MemoryRouter>,
  )
  return { onEdit, onDelete, user: userEvent.setup() }
}

describe('ClientPopupCard', () => {
  // Given a client with type, zone and channel
  // When the card is rendered
  // Then it should show the name, type, zone and channel
  it('shows the client details', () => {
    renderCard()

    expect(screen.getByText('Laura Martínez')).toBeInTheDocument()
    expect(screen.getByText('Panadería')).toBeInTheDocument()
    expect(screen.getByText('Manresa')).toBeInTheDocument()
    expect(screen.getByText('Canales:')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
  })

  // Given any client
  // When the card is rendered
  // Then "Ver cliente" should link to the client detail
  it('links to the client detail', () => {
    renderCard()

    expect(screen.getByRole('link', { name: /Ver cliente/ })).toHaveAttribute(
      'href',
      '/clients/client-1',
    )
  })

  // Given the orders module does not exist yet
  // When the card is rendered
  // Then the orders line should show a placeholder
  it('shows a placeholder line for the orders', () => {
    renderCard()

    expect(screen.getByText('Pedidos: —')).toBeInTheDocument()
  })

  // Given a client placed at the centre of its zone
  // When the card is rendered
  // Then it should warn that the location is approximate
  it('warns when the location is approximate', () => {
    renderCard({ ...mockClient, approximate: true })

    expect(screen.getByText(/Ubicación aproximada/)).toBeInTheDocument()
  })

  // Given a client with an exact location
  // When the card is rendered
  // Then there should be no approximate warning
  it('does not warn when the location is exact', () => {
    renderCard()

    expect(screen.queryByText(/Ubicación aproximada/)).not.toBeInTheDocument()
  })

  // Given a client without type, zone or channels
  // When the card is rendered
  // Then it should still render with a fallback zone and no empty rows
  it('handles a client without type, zone or channels', () => {
    renderCard({ ...mockClient, type: null, zone: null, channels: [] })

    expect(screen.getByText('Sin zona')).toBeInTheDocument()
    expect(screen.queryByText('Panadería')).not.toBeInTheDocument()
    expect(screen.queryByText('Canales:')).not.toBeInTheDocument()
  })

  // Given the card is open
  // When the user clicks the edit button
  // Then onEdit should be called
  it('calls onEdit from the edit button', async () => {
    const { onEdit, onDelete, user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar cliente' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onDelete).not.toHaveBeenCalled()
  })

  // Given the card is open
  // When the user clicks the delete button
  // Then onDelete should be called
  it('calls onDelete from the delete button', async () => {
    const { onEdit, onDelete, user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Eliminar cliente' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onEdit).not.toHaveBeenCalled()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ApproximateClientsCard } from './ApproximateClientsCard'
import type { MapClient } from '../../types/map.types'

const approximateClient: MapClient = {
  id: 'client-1',
  name: 'Luis Prats',
  latitude: 41.7,
  longitude: 1.8,
  zone: 'Manresa',
  channels: [],
  type: null,
  approximate: true,
  orderCount: 0,
  deliveredRevenue: '0',
}

describe('ApproximateClientsCard', () => {
  // Given a client placed at the centre of its zone
  // When the card is rendered
  // Then it should list the client with their zone
  it('lists the clients without an exact location', () => {
    render(<ApproximateClientsCard clients={[approximateClient]} onAddAddress={vi.fn()} />)

    expect(screen.getByText('Luis Prats')).toBeInTheDocument()
    expect(screen.getByText('Manresa')).toBeInTheDocument()
  })

  // Given a listed client
  // When the user clicks "Añadir dirección"
  // Then onAddAddress should be called with that client
  it('calls onAddAddress with the client', async () => {
    const onAddAddress = vi.fn()
    render(<ApproximateClientsCard clients={[approximateClient]} onAddAddress={onAddAddress} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Añadir dirección' }))

    expect(onAddAddress).toHaveBeenCalledWith(approximateClient)
  })

  // Given every client has an exact location
  // When the card is rendered
  // Then a positive message should be shown instead of a list
  it('shows a message when every client has an exact location', () => {
    render(<ApproximateClientsCard clients={[]} onAddAddress={vi.fn()} />)

    expect(screen.getByText('Todos tus clientes tienen ubicación exacta.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir dirección' })).not.toBeInTheDocument()
  })
})

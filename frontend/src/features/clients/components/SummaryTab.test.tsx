import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SummaryTab } from './SummaryTab'
import type { ClientDetail } from '../hooks/useClientDetail'

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
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('SummaryTab', () => {
  // Given a client
  // When SummaryTab is rendered
  // Then the real createdAt date should be shown as "Cliente desde"
  it('shows the client creation date', () => {
    render(<SummaryTab client={mockClient} />)
    expect(screen.getByText('Cliente desde')).toBeInTheDocument()
    expect(screen.getByText('01 ene 2026')).toBeInTheDocument()
  })

  // Given a client with no address or zone
  // When SummaryTab is rendered
  // Then a dash should be shown for the location
  it('shows a dash for the location when the client has none', () => {
    render(<SummaryTab client={mockClient} />)
    // Ubicación, Total de pedidos and Valor total all show a dash here
    expect(screen.getAllByText('—')).toHaveLength(3)
  })

  // Given a client with an address and zone
  // When SummaryTab is rendered
  // Then that location should be shown
  it('shows the client address and zone as the location', () => {
    render(<SummaryTab client={{ ...mockClient, address: 'Rambla 22', zone: 'Figueres' }} />)
    expect(screen.getByText('Rambla 22, Figueres')).toBeInTheDocument()
  })

  // Given a client
  // When SummaryTab is rendered
  // Then "Pedidos recientes" should explain it's blocked by the Order module
  it('shows "Pedidos recientes" with an honest blocked message', () => {
    render(<SummaryTab client={mockClient} />)
    expect(screen.getByText('Pedidos recientes')).toBeInTheDocument()
    expect(
      screen.getAllByText('Disponible cuando exista el módulo de pedidos').length,
    ).toBeGreaterThan(0)
  })

  // Given a client
  // When SummaryTab is rendered
  // Then "Últimas conversaciones" should explain it's out of scope, not blocked
  it('shows "Últimas conversaciones" as out of scope, not blocked', () => {
    render(<SummaryTab client={mockClient} />)
    expect(screen.getByText('Últimas conversaciones')).toBeInTheDocument()
    expect(screen.getByText('Esta función no está disponible todavía')).toBeInTheDocument()
  })
})

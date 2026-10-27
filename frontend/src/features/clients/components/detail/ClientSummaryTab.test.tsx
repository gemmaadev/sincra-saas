import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { ClientSummaryTab } from './ClientSummaryTab'
import type { ClientDetail } from '../../types/client.types'

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

function renderClientSummaryTab(client: ClientDetail) {
  return render(
    <MantineProvider>
      <ClientSummaryTab client={client} />
    </MantineProvider>,
  )
}

describe('ClientSummaryTab', () => {
  // Given a client
  // When ClientSummaryTab is rendered
  // Then the real createdAt date should be shown as "Cliente desde"
  it('shows the client creation date', () => {
    renderClientSummaryTab(mockClient)
    expect(screen.getByText('Cliente desde')).toBeInTheDocument()
    expect(screen.getByText('01 ene 2026')).toBeInTheDocument()
  })

  // Given a client with no address or zone
  // When ClientSummaryTab is rendered
  // Then a dash should be shown for the location
  it('shows a dash for the location when the client has none', () => {
    renderClientSummaryTab(mockClient)
    expect(screen.getAllByText('—')).toHaveLength(1)
  })

  // Given a client with no orders
  // When ClientSummaryTab is rendered
  // Then the total orders and total value should show 0
  it('shows 0 orders and 0€ when the client has no orders', () => {
    renderClientSummaryTab(mockClient)
    expect(screen.getByText('Total de pedidos').nextSibling).toHaveTextContent('0')
    expect(screen.getByText('0,00 €')).toBeInTheDocument()
  })

  // Given a client with a delivered order, a pending one and a cancelled one
  // When ClientSummaryTab is rendered
  // Then "Total de pedidos" counts all of them, but "Valor total" only the delivered one
  it('counts every order but only totals the value of delivered ones', () => {
    renderClientSummaryTab({
      ...mockClient,
      orders: [
        {
          id: 'order-1',
          number: 1,
          status: 'DELIVERED',
          kind: 'PRODUCT',
          channel: null,
          price: '89.90',
          expectedDate: null,
          createdAt: '2026-10-01T00:00:00.000Z',
          description: 'Chaqueta oversize',
        },
        {
          id: 'order-2',
          number: 2,
          status: 'PENDING',
          kind: 'PRODUCT',
          channel: null,
          price: '10.10',
          expectedDate: null,
          createdAt: '2026-10-02T00:00:00.000Z',
          description: 'Gorra personalizada',
        },
        {
          id: 'order-3',
          number: 3,
          status: 'CANCELLED',
          kind: 'PRODUCT',
          channel: null,
          price: '500',
          expectedDate: null,
          createdAt: '2026-10-03T00:00:00.000Z',
          description: 'Mochila urbana',
        },
      ],
    })
    expect(screen.getByText('Total de pedidos').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('89,90 €')).toBeInTheDocument()
    expect(screen.getByText('Chaqueta oversize')).toBeInTheDocument()
  })

  // Given a client with an address and zone
  // When ClientSummaryTab is rendered
  // Then that location should be shown
  it('shows the client address and zone as the location', () => {
    renderClientSummaryTab({ ...mockClient, address: 'Rambla 22', zone: 'Figueres' })
    expect(screen.getByText('Rambla 22, Figueres')).toBeInTheDocument()
  })

  // Given a client with no orders
  // When ClientSummaryTab is rendered
  // Then "Pedidos recientes" should say there are none, not that the feature is blocked
  it('shows "Pedidos recientes" as empty, not as blocked', () => {
    renderClientSummaryTab(mockClient)
    expect(screen.getByText('Pedidos recientes')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay pedidos para este cliente.')).toBeInTheDocument()
  })

  // Given a client with 4 orders
  // When ClientSummaryTab is rendered
  // Then only the 3 most recent should be listed
  it('lists at most the 3 most recent orders', () => {
    const orders = [1, 2, 3, 4].map((number) => ({
      id: `order-${number}`,
      number,
      status: 'PENDING' as const,
      kind: 'PRODUCT' as const,
      channel: null,
      price: '10',
      expectedDate: null,
      createdAt: '2026-10-01T00:00:00.000Z',
      description: `Pedido ${number}`,
    }))
    renderClientSummaryTab({ ...mockClient, orders })

    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('#3')).toBeInTheDocument()
    expect(screen.queryByText('#4')).not.toBeInTheDocument()
  })

  // Given a client
  // When ClientSummaryTab is rendered
  // Then "Últimas conversaciones" should explain it's out of scope, not blocked
  it('shows "Últimas conversaciones" as out of scope, not blocked', () => {
    renderClientSummaryTab(mockClient)
    expect(screen.getByText('Últimas conversaciones')).toBeInTheDocument()
    expect(screen.getByText('Esta función no está disponible todavía')).toBeInTheDocument()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderDetailPanel } from './OrderDetailPanel'
import { api } from '@/shared/services'
import type { OrderDetail } from '../types/order.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

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
  description: 'Camiseta',
  notes: null,
  client: { id: 'client-1', name: 'Laura García', email: null, phone: null, channels: [] },
  items: [],
  statusHistory: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <OrderDetailPanel id="order-1" />
    </QueryClientProvider>,
  )
}

describe('OrderDetailPanel', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given the order is still loading
  // When the panel is rendered
  // Then it should show a loading message
  it('shows a loading message while the order is loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))
    renderPanel()

    expect(screen.getByText('Cargando pedido...')).toBeInTheDocument()
  })

  // Given the order fails to load
  // When the panel is rendered
  // Then it should show an error message
  it('shows an error message when the order fails to load', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network'))
    renderPanel()

    expect(await screen.findByText('No se ha podido cargar el pedido.')).toBeInTheDocument()
  })

  // Given the order loads successfully
  // When the panel is rendered
  // Then it should show the order number as the panel title
  it('shows the order number', async () => {
    vi.mocked(api.get).mockResolvedValue({ order: mockOrder })
    renderPanel()

    expect(await screen.findByText('Pedido #7')).toBeInTheDocument()
  })

  // Given the order loads successfully
  // When the panel is rendered
  // Then it should show all five tabs, with "Etiquetas" disabled
  it('shows the five tabs with Etiquetas disabled', async () => {
    vi.mocked(api.get).mockResolvedValue({ order: mockOrder })
    renderPanel()
    await waitFor(() => expect(screen.getByText('Pedido #7')).toBeInTheDocument())

    expect(screen.getByRole('tab', { name: 'Resumen' })).toBeEnabled()
    expect(screen.getByRole('tab', { name: 'Productos' })).toBeEnabled()
    expect(screen.getByRole('tab', { name: 'Seguimiento' })).toBeEnabled()
    expect(screen.getByRole('tab', { name: 'Notas' })).toBeEnabled()
    expect(screen.getByRole('tab', { name: 'Etiquetas' })).toBeDisabled()
  })

  // Given an order with items
  // When the user switches to the Productos tab
  // Then it should list those items
  it('shows the order items on the Productos tab', async () => {
    vi.mocked(api.get).mockResolvedValue({
      order: {
        ...mockOrder,
        items: [{ id: 'item-1', product: 'Camiseta', description: null, quantity: 1, unitPrice: '15.00' }],
      },
    })
    renderPanel()
    await screen.findByText('Pedido #7')

    await userEvent.setup().click(screen.getByRole('tab', { name: 'Productos' }))

    expect(await screen.findByText('Camiseta')).toBeInTheDocument()
  })
})

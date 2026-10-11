import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderDetailPanel } from './OrderDetailPanel'
import { api } from '@/shared/services'
import type { OrderDetail } from '../types/order.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

const mockNavigate = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
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
  client: { id: 'client-1', name: 'Laura García', email: null, phone: null, channels: [] },
  items: [],
  statusHistory: [],
  orderTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function mockApiGet(order: OrderDetail = mockOrder) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.endsWith('/notes')) {
      return Promise.resolve({ notes: [] })
    }
    if (path === '/tags') {
      return Promise.resolve({ tags: [] })
    }
    return Promise.resolve({ order })
  })
}

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <OrderDetailPanel id="order-1" />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('OrderDetailPanel', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    mockNavigate.mockReset()
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
    mockApiGet()
    renderPanel()

    expect(await screen.findByText('Pedido #7')).toBeInTheDocument()
  })

  // Given an order whose client has an email and a phone on record
  // When the panel is rendered
  // Then the header should show the client's name, email and phone
  it("shows the client's name, email and phone in the header", async () => {
    mockApiGet({
      ...mockOrder,
      client: { ...mockOrder.client, email: 'laura@ejemplo.test', phone: '600111222' },
    })
    renderPanel()

    expect(await screen.findByText('Laura García')).toBeInTheDocument()
    expect(screen.getByText('laura@ejemplo.test')).toBeInTheDocument()
    expect(screen.getByText('600111222')).toBeInTheDocument()
  })

  // Given a loaded order
  // When the user clicks the edit action
  // Then the order form modal should open prefilled with the order's data
  it('opens the edit modal prefilled with the order data', async () => {
    mockApiGet({
      ...mockOrder,
      items: [{ id: 'item-1', product: 'Camiseta', description: null, quantity: 1, unitPrice: '15.00' }],
    })
    renderPanel()
    await screen.findByText('Pedido #7')

    await userEvent.setup().click(screen.getByLabelText('Editar pedido'))

    const dialog = await screen.findByRole('dialog', { name: 'Editar pedido' })
    expect(within(dialog).getByText('Laura García')).toBeInTheDocument()
    expect(within(dialog).getByDisplayValue('Camiseta')).toBeInTheDocument()
  })

  // Given the order loads successfully
  // When the panel is rendered
  // Then it should show all five tabs, all enabled (Etiquetas has its own backend support now)
  it('shows the five tabs, all enabled', async () => {
    mockApiGet()
    renderPanel()
    await waitFor(() => expect(screen.getByText('Pedido #7')).toBeInTheDocument())

    expect(screen.getByRole('tab', { name: 'Resumen' })).toBeEnabled()
    expect(screen.getByRole('tab', { name: 'Productos' })).toBeEnabled()
    expect(screen.getByRole('tab', { name: 'Seguimiento' })).toBeEnabled()
    expect(screen.getByRole('tab', { name: 'Notas' })).toBeEnabled()
    expect(screen.getByRole('tab', { name: 'Etiquetas' })).toBeEnabled()
  })

  // Given an order with items
  // When the user switches to the Productos tab
  // Then it should list those items
  it('shows the order items on the Productos tab', async () => {
    mockApiGet({
      ...mockOrder,
      items: [{ id: 'item-1', product: 'Camiseta', description: null, quantity: 1, unitPrice: '15.00' }],
    })
    renderPanel()
    await screen.findByText('Pedido #7')

    await userEvent.setup().click(screen.getByRole('tab', { name: 'Productos' }))

    expect(await screen.findByText('Camiseta')).toBeInTheDocument()
  })

  // Given an order
  // When the user switches to the Seguimiento tab
  // Then it should show the order's timeline
  it('shows the timeline on the Seguimiento tab', async () => {
    mockApiGet()
    renderPanel()
    await screen.findByText('Pedido #7')

    await userEvent.setup().click(screen.getByRole('tab', { name: 'Seguimiento' }))

    expect(await screen.findByText('Pedido recibido')).toBeInTheDocument()
    expect(screen.getByText('Entregado')).toBeInTheDocument()
  })

  // Given an order
  // When the user switches to the Notas tab
  // Then the real OrderNotesTab content (its "add note" form) should be shown
  it('shows the OrderNotesTab content on the Notas tab', async () => {
    mockApiGet()
    renderPanel()
    await screen.findByText('Pedido #7')

    await userEvent.setup().click(screen.getByRole('tab', { name: 'Notas' }))

    expect(
      await screen.findByPlaceholderText('Escribe una nota sobre este pedido...'),
    ).toBeInTheDocument()
  })

  // Given an order with an assigned tag
  // When the user switches to the Etiquetas tab
  // Then the real OrderTagsTab content should list it
  it('shows the OrderTagsTab content on the Etiquetas tab', async () => {
    mockApiGet({
      ...mockOrder,
      orderTags: [
        {
          id: 'assignment-1',
          tagId: 'tag-1',
          aiGenerated: false,
          tag: { id: 'tag-1', name: 'VIP', color: '#ffb800', priority: 'LOW', isDefault: false },
        },
      ],
    })
    renderPanel()
    await screen.findByText('Pedido #7')

    await userEvent.setup().click(screen.getByRole('tab', { name: 'Etiquetas' }))

    expect(await screen.findByText('VIP')).toBeInTheDocument()
  })

  // Given a loaded order that is not yet in a final status
  // When the user confirms "Cancelar pedido"
  // Then it should PATCH the order's status to CANCELLED and stay on the panel
  it('cancels the order and keeps the record', async () => {
    mockApiGet()
    vi.mocked(api.patch).mockResolvedValue({})
    renderPanel()
    await screen.findByText('Pedido #7')

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Cancelar pedido'))
    const dialog = await screen.findByRole('dialog', { name: '¿Cancelar pedido?' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar pedido' }))

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/orders/order-1', { status: 'CANCELLED' }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // Given a loaded order
  // When the user confirms "Eliminar pedido"
  // Then it should DELETE the order and navigate back to the orders list
  it('deletes the order and navigates back to the orders list', async () => {
    mockApiGet()
    vi.mocked(api.delete).mockResolvedValue({})
    renderPanel()
    await screen.findByText('Pedido #7')

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Eliminar pedido'))
    const dialog = await screen.findByRole('dialog', { name: '¿Eliminar pedido?' })
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/orders/order-1'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/orders'))
  })

  // Given an order that already reached a final status (DELIVERED)
  // When the panel is rendered
  // Then the "Cancelar pedido" action should be disabled, since that transition is blocked
  it('disables cancelling an order that is already DELIVERED', async () => {
    mockApiGet({ ...mockOrder, status: 'DELIVERED' })
    renderPanel()
    await screen.findByText('Pedido #7')

    expect(screen.getByLabelText('Cancelar pedido')).toBeDisabled()
  })
})

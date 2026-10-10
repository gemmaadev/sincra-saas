import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { EditOrderModal } from './EditOrderModal'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }
})

const mockOrder = {
  id: 'order-1',
  number: 7,
  status: 'PENDING',
  channel: 'WHATSAPP',
  kind: 'PRODUCT',
  price: '15.00',
  address: null,
  zone: null,
  expectedDate: null,
  description: null,
  client: { id: 'client-1', name: 'Laura García', email: null, phone: null, channels: [] },
  items: [{ id: 'item-1', product: 'Camiseta', description: null, quantity: 1, unitPrice: '15.00' }],
  statusHistory: [],
  orderTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderModal() {
  render(
    withQueryClient(
      <MantineProvider>
        <EditOrderModal orderId="order-1" opened onClose={vi.fn()} />
      </MantineProvider>,
    ),
  )
}

describe('EditOrderModal', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given an order id
  // When the modal is opened
  // Then it should load the order and show the edit form with its data
  it('loads the order and shows the edit form', async () => {
    vi.mocked(api.get).mockResolvedValue({ order: mockOrder })
    renderModal()

    expect(await screen.findByRole('dialog', { name: 'Editar pedido' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/orders/order-1')
    expect(screen.getByDisplayValue('Camiseta')).toBeInTheDocument()
  })

  // Given the order is still loading
  // When the modal is rendered
  // Then nothing should be shown yet
  it('shows nothing while the order is loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

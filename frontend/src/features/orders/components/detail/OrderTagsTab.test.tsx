import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { OrderTagsTab } from './OrderTagsTab'
import type { OrderDetail } from '../../types/order.types'

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

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }
})

const vipTag = { id: 'tag-vip', name: 'VIP', color: '#ffb800', priority: 'LOW', isDefault: true }
const urgentTag = {
  id: 'tag-urgent',
  name: 'Urgente',
  color: '#e5484d',
  priority: 'LOW',
  isDefault: true,
}

function orderWithTags(tags: { tag: typeof vipTag; aiGenerated?: boolean }[]): OrderDetail {
  return {
    ...mockOrder,
    orderTags: tags.map(({ tag, aiGenerated = false }) => ({
      id: `assignment-${tag.id}`,
      tagId: tag.id,
      aiGenerated,
      tag: { ...tag, priority: 'LOW' as const },
    })),
  }
}

function renderOrderTagsTab(order: OrderDetail = mockOrder) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <MantineProvider env="test">
      <QueryClientProvider client={queryClient}>
        <OrderTagsTab order={order} />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('OrderTagsTab', () => {
  beforeEach(() => {
    vi.mocked(api.get)
      .mockReset()
      .mockResolvedValue({ tags: [vipTag, urgentTag] })
    vi.mocked(api.post).mockReset().mockResolvedValue({})
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
  })

  // Given an order with no tags
  // When OrderTagsTab is rendered
  // Then an empty-state message should be shown
  it('shows an empty state when there are no tags', () => {
    renderOrderTagsTab()

    expect(screen.getByText('Este pedido no tiene etiquetas todavía.')).toBeInTheDocument()
  })

  // Given an order with tags
  // When OrderTagsTab is rendered
  // Then each tag should be shown
  it('shows the order tags when present', () => {
    renderOrderTagsTab(orderWithTags([{ tag: vipTag }]))

    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.queryByText('Este pedido no tiene etiquetas todavía.')).not.toBeInTheDocument()
  })

  // Given a tag that the AI assigned and one that a person assigned
  // When OrderTagsTab is rendered
  // Then only the AI one should carry the "Sugerido por IA" badge
  it('marks the tags assigned by the AI', () => {
    renderOrderTagsTab(orderWithTags([{ tag: vipTag, aiGenerated: true }, { tag: urgentTag }]))

    expect(screen.getAllByText('Sugerido por IA')).toHaveLength(1)
  })

  // Given an order with a tag
  // When the user clicks its remove button
  // Then the tag should be removed from the order through the API
  it('removes a tag from the order', async () => {
    renderOrderTagsTab(orderWithTags([{ tag: vipTag }]))

    fireEvent.click(screen.getByRole('button', { name: 'Quitar etiqueta VIP' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/orders/order-1/tags/tag-vip'))
  })

  // Given a catalog tag that the order does not have yet
  // When the user picks it in the selector
  // Then it should be assigned to the order
  it('adds an existing tag to the order', async () => {
    renderOrderTagsTab(orderWithTags([{ tag: vipTag }]))

    fireEvent.click(screen.getByRole('button', { name: 'Añadir etiqueta' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Urgente' }))

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/orders/order-1/tags', { tagId: 'tag-urgent' }),
    )
  })

  // Given a name that is not in the catalog
  // When the user chooses "Crear"
  // Then the tag should be created with an automatic color and then assigned to the order
  it('creates a new tag and assigns it', async () => {
    vi.mocked(api.post).mockImplementation((path: string) =>
      path === '/tags'
        ? Promise.resolve({ tag: { id: 'tag-new', name: 'Mayorista', color: '#8b5cf6' } })
        : Promise.resolve({}),
    )
    renderOrderTagsTab()

    fireEvent.click(screen.getByRole('button', { name: 'Añadir etiqueta' }))
    fireEvent.change(await screen.findByLabelText('Buscar o crear etiqueta'), {
      target: { value: 'Mayorista' },
    })
    fireEvent.click(screen.getByRole('option', { name: 'Crear «Mayorista»' }))

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/tags', {
        name: 'Mayorista',
        color: expect.stringMatching(/^#[0-9a-f]{6}$/),
      }),
    )
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/orders/order-1/tags', { tagId: 'tag-new' }),
    )
  })

  // Given the backend rejects the assignment with a message
  // When the user picks a tag
  // Then that message should be shown
  it('shows the backend error when assigning fails', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('Este pedido ya tiene esa etiqueta', 409, 'TAG_ALREADY_ASSIGNED'),
    )
    renderOrderTagsTab()

    fireEvent.click(screen.getByRole('button', { name: 'Añadir etiqueta' }))
    fireEvent.click(await screen.findByRole('option', { name: 'VIP' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Este pedido ya tiene esa etiqueta')
  })
})

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrderDetail } from './useOrderDetail'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockOrder = {
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
  client: { id: 'client-1', name: 'Laura García', email: 'laura@ejemplo.test', phone: null },
  items: [{ id: 'item-1', product: 'Camiseta', description: null, quantity: 1, unitPrice: '50.00' }],
  statusHistory: [{ id: 'change-1', status: 'PENDING', changedBy: null, changedAt: '2026-01-01T00:00:00.000Z' }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderUseOrderDetail(id: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useOrderDetail(id), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useOrderDetail', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ order: mockOrder })
  })

  // Given an order id
  // When useOrderDetail is called
  // Then it should request GET /orders/:id
  it('requests /orders/:id', async () => {
    const { result } = renderUseOrderDetail('order-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/orders/order-1')
  })

  // Given a successful response
  // When useOrderDetail resolves
  // Then it should return the order, unwrapped from the { order } envelope
  it('returns the order from the response', async () => {
    const { result } = renderUseOrderDetail('order-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockOrder)
  })
})

import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useSaveOrder } from './useSaveOrder'
import type { OrderFormValues } from '../types/order.types'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn(), patch: vi.fn() },
}))

const values: OrderFormValues = {
  clientId: 'client-1',
  clientName: 'Laura García',
  items: [{ product: 'Camiseta', description: '', quantity: 1, unitPrice: 15 }],
  channel: '',
  zone: '',
  address: '',
  expectedDate: '',
  description: '',
}

function renderSaveOrder(orderId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useSaveOrder(orderId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useSaveOrder', () => {
  beforeEach(() => {
    vi.mocked(api.post)
      .mockReset()
      .mockResolvedValue({ order: { id: 'order-9' } })
    vi.mocked(api.patch)
      .mockReset()
      .mockResolvedValue({ order: { id: 'order-1' } })
  })

  // Given no order id
  // When the mutation runs
  // Then it should POST to /orders and refresh the orders list
  it('creates an order and invalidates the orders list', async () => {
    const { result, invalidateQueries } = renderSaveOrder()

    await act(async () => {
      await result.current.mutateAsync(values)
    })

    expect(api.post).toHaveBeenCalledWith('/orders', expect.objectContaining({ clientId: 'client-1' }))
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
    expect(invalidateQueries).not.toHaveBeenCalledWith({ queryKey: ['order', expect.anything()] })
  })

  // Given an order id
  // When the mutation runs
  // Then it should PATCH that order and refresh both the list and that order's detail
  it('updates an order and invalidates the list and the detail', async () => {
    const { result, invalidateQueries } = renderSaveOrder('order-1')

    await act(async () => {
      await result.current.mutateAsync(values)
    })

    expect(api.patch).toHaveBeenCalledWith(
      '/orders/order-1',
      expect.objectContaining({ clientId: 'client-1' }),
    )
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['order', 'order-1'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh any query
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderSaveOrder()

    await act(async () => {
      await result.current.mutateAsync(values).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

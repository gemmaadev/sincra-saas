import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useUpdateOrderStatus } from './useUpdateOrderStatus'

vi.mock('@/shared/services', () => ({
  api: { patch: vi.fn() },
}))

function renderUpdateOrderStatus(orderId = 'order-1') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useUpdateOrderStatus(orderId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useUpdateOrderStatus', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue(null)
  })

  // Given an order id and a new status
  // When the mutation runs
  // Then it should PATCH that order and refresh the order queries
  it('updates the order status and invalidates the order queries', async () => {
    const { result, invalidateQueries } = renderUpdateOrderStatus('order-1')

    await act(async () => {
      await result.current.mutateAsync('PREPARING')
    })

    expect(api.patch).toHaveBeenCalledWith('/orders/order-1', { status: 'PREPARING' })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['order', 'order-1'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh anything
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderUpdateOrderStatus()

    await act(async () => {
      await result.current.mutateAsync('PREPARING').catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

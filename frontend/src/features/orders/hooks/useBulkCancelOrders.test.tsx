import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { useBulkCancelOrders } from './useBulkCancelOrders'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { patch: vi.fn() } }
})

function renderBulkCancel() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useBulkCancelOrders(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useBulkCancelOrders', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue({ order: {} })
  })

  // Given several order ids
  // When the mutation runs
  // Then it should PATCH each one to CANCELLED, report no failures and refresh the list
  it('cancels every order and invalidates the orders list', async () => {
    const { result, invalidateQueries } = renderBulkCancel()

    let outcome: { failedIds: string[] } | undefined
    await act(async () => {
      outcome = await result.current.mutateAsync(['a', 'b', 'c'])
    })

    expect(api.patch).toHaveBeenCalledTimes(3)
    expect(api.patch).toHaveBeenCalledWith('/orders/a', { status: 'CANCELLED' })
    expect(api.patch).toHaveBeenCalledWith('/orders/c', { status: 'CANCELLED' })
    expect(outcome).toEqual({ failedIds: [] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
  })

  // Given one of the orders cannot be cancelled (e.g. it was already DELIVERED)
  // When the mutation runs
  // Then it should still try all of them and report the failed id
  it('reports the ids that could not be cancelled', async () => {
    vi.mocked(api.patch)
      .mockResolvedValueOnce({ order: {} })
      .mockRejectedValueOnce(new ApiError('Estado de pedido no válido', 400, 'ORDER_STATUS_FINAL'))
      .mockResolvedValueOnce({ order: {} })
    const { result, invalidateQueries } = renderBulkCancel()

    let outcome: { failedIds: string[] } | undefined
    await act(async () => {
      outcome = await result.current.mutateAsync(['a', 'b', 'c'])
    })

    expect(api.patch).toHaveBeenCalledTimes(3)
    expect(outcome).toEqual({ failedIds: ['b'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
  })
})

import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { useBulkDeleteOrders } from './useBulkDeleteOrders'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { delete: vi.fn() } }
})

function renderBulkDelete() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useBulkDeleteOrders(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useBulkDeleteOrders', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
  })

  // Given several order ids
  // When the mutation runs
  // Then it should DELETE each one, report no failures and refresh the list
  it('deletes every order and invalidates the orders list', async () => {
    const { result, invalidateQueries } = renderBulkDelete()

    let outcome: { failedIds: string[] } | undefined
    await act(async () => {
      outcome = await result.current.mutateAsync(['a', 'b', 'c'])
    })

    expect(api.delete).toHaveBeenCalledTimes(3)
    expect(api.delete).toHaveBeenCalledWith('/orders/a')
    expect(api.delete).toHaveBeenCalledWith('/orders/c')
    expect(outcome).toEqual({ failedIds: [] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
  })

  // Given one of the deletions fails
  // When the mutation runs
  // Then it should still try all of them and report the failed id
  it('reports the ids that could not be deleted', async () => {
    vi.mocked(api.delete)
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new ApiError('Error', 500, 'INTERNAL_SERVER_ERROR'))
      .mockResolvedValueOnce(null)
    const { result, invalidateQueries } = renderBulkDelete()

    let outcome: { failedIds: string[] } | undefined
    await act(async () => {
      outcome = await result.current.mutateAsync(['a', 'b', 'c'])
    })

    expect(api.delete).toHaveBeenCalledTimes(3)
    expect(outcome).toEqual({ failedIds: ['b'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
  })

  // Given an order that no longer exists (404)
  // When the mutation runs
  // Then it should count as deleted, since the goal was that it does not exist
  it('treats a 404 as already deleted', async () => {
    vi.mocked(api.delete).mockRejectedValueOnce(
      new ApiError('Pedido no encontrado', 404, 'ORDER_NOT_FOUND'),
    )
    const { result } = renderBulkDelete()

    let outcome: { failedIds: string[] } | undefined
    await act(async () => {
      outcome = await result.current.mutateAsync(['a'])
    })

    expect(outcome).toEqual({ failedIds: [] })
  })
})

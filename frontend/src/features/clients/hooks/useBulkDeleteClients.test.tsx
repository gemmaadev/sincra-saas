import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { useBulkDeleteClients } from './useBulkDeleteClients'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { delete: vi.fn() } }
})

function renderBulkDelete() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useBulkDeleteClients(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useBulkDeleteClients', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
  })

  // Given several client ids
  // When the mutation runs
  // Then it should DELETE each one, report no failures and refresh the list
  it('deletes every client and invalidates the clients list', async () => {
    const { result, invalidateQueries } = renderBulkDelete()

    let outcome: { failedIds: string[] } | undefined
    await act(async () => {
      outcome = await result.current.mutateAsync(['a', 'b', 'c'])
    })

    expect(api.delete).toHaveBeenCalledTimes(3)
    expect(api.delete).toHaveBeenCalledWith('/clients/a')
    expect(api.delete).toHaveBeenCalledWith('/clients/c')
    expect(outcome).toEqual({ failedIds: [] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
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
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
  })

  // Given a client that no longer exists (404)
  // When the mutation runs
  // Then it should count as deleted, since the goal was that it does not exist
  it('treats a 404 as already deleted', async () => {
    vi.mocked(api.delete).mockRejectedValueOnce(
      new ApiError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND'),
    )
    const { result } = renderBulkDelete()

    let outcome: { failedIds: string[] } | undefined
    await act(async () => {
      outcome = await result.current.mutateAsync(['a'])
    })

    expect(outcome).toEqual({ failedIds: [] })
  })
})

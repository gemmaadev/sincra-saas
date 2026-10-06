import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useDeleteClient } from './useDeleteClient'

vi.mock('@/shared/services', () => ({
  api: { delete: vi.fn() },
}))

function renderDeleteClient(clientId = 'client-1') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useDeleteClient(clientId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useDeleteClient', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
  })

  // Given a client id
  // When the mutation runs
  // Then it should DELETE that client and refresh the clients list
  it('deletes the client and invalidates the clients list', async () => {
    const { result, invalidateQueries } = renderDeleteClient('client-1')

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(api.delete).toHaveBeenCalledWith('/clients/client-1')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh the list
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.delete).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderDeleteClient()

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

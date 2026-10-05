import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useRemoveClientTag } from './useRemoveClientTag'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn(), delete: vi.fn() },
}))

function renderHookWithClient() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useRemoveClientTag('client-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useRemoveClientTag', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset().mockResolvedValue(null)
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
  })

  // Given a tag id
  // When the mutation runs
  // Then it removes the tag and refreshes the client list and the client detail
  it('removes the tag and invalidates the client queries', async () => {
    const { result, invalidateQueries } = renderHookWithClient()

    await act(async () => {
      await result.current.mutateAsync('tag-1')
    })

    expect(api.delete).toHaveBeenCalledWith('/clients/client-1/tags/tag-1')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['client', 'client-1'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh anything
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.delete).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderHookWithClient()

    await act(async () => {
      await result.current.mutateAsync('tag-1').catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useAssignOrderTag } from './useAssignOrderTag'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn(), delete: vi.fn() },
}))

function renderHookWithClient() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useAssignOrderTag('order-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useAssignOrderTag', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset().mockResolvedValue(null)
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
  })

  // Given a tag id
  // When the mutation runs
  // Then it assigns the tag and refreshes the order list and the order detail
  it('assigns the tag and invalidates the order queries', async () => {
    const { result, invalidateQueries } = renderHookWithClient()

    await act(async () => {
      await result.current.mutateAsync('tag-1')
    })

    expect(api.post).toHaveBeenCalledWith('/orders/order-1/tags', { tagId: 'tag-1' })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['order', 'order-1'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh anything
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderHookWithClient()

    await act(async () => {
      await result.current.mutateAsync('tag-1').catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

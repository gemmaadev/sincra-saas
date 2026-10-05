import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useCreateTag } from './useCreateTag'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn() },
}))

function renderCreateTag() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useCreateTag(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useCreateTag', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
  })

  // Given the data of a new tag
  // When the mutation runs
  // Then it should POST to /tags, return the created tag and refresh the tags list
  it('creates the tag, returns it and invalidates the tags list', async () => {
    const createdTag = { id: 'tag-9', name: 'Mayorista', color: '#112233' }
    vi.mocked(api.post).mockResolvedValue({ tag: createdTag })
    const { result, invalidateQueries } = renderCreateTag()

    let returnedTag: unknown
    await act(async () => {
      returnedTag = await result.current.mutateAsync({ name: 'Mayorista', color: '#112233' })
    })

    expect(api.post).toHaveBeenCalledWith('/tags', { name: 'Mayorista', color: '#112233' })
    expect(returnedTag).toEqual(createdTag)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tags'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh the list
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderCreateTag()

    await act(async () => {
      await result.current.mutateAsync({ name: 'VIP', color: '#112233' }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

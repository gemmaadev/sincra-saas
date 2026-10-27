import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useDeleteTag } from './useDeleteTag'

vi.mock('@/shared/services', () => ({
  api: { delete: vi.fn() },
}))

function renderUseDeleteTag() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useDeleteTag(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useDeleteTag', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset().mockResolvedValue(undefined)
  })

  // Given a tag id
  // When the mutation runs
  // Then it should DELETE that tag and refresh the tags list
  it('deletes the tag and invalidates the tags query', async () => {
    const { result, invalidateQueries } = renderUseDeleteTag()

    await act(async () => {
      await result.current.mutateAsync('tag-1')
    })

    expect(api.delete).toHaveBeenCalledWith('/tags/tag-1')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tags'] })
  })
})

import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useUpdateTag } from './useUpdateTag'

vi.mock('@/shared/services', () => ({
  api: { patch: vi.fn() },
}))

function renderUseUpdateTag() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useUpdateTag(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useUpdateTag', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue({
      tag: { id: 'tag-1', name: 'Urgente', color: '#e5484d', priority: 'HIGH', isDefault: false },
    })
  })

  // Given a tag id and a new name
  // When the mutation runs
  // Then it should PATCH only the changed field and refresh the tags list
  it('updates the tag and invalidates the tags query', async () => {
    const { result, invalidateQueries } = renderUseUpdateTag()

    await act(async () => {
      await result.current.mutateAsync({ id: 'tag-1', name: 'Urgentísimo' })
    })

    expect(api.patch).toHaveBeenCalledWith('/tags/tag-1', { name: 'Urgentísimo' })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tags'] })
  })
})

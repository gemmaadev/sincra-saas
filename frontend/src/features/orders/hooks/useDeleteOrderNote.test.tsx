import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDeleteOrderNote } from './useDeleteOrderNote'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

function renderUseDeleteOrderNote() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const { result } = renderHook(() => useDeleteOrderNote('order-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { result, queryClient }
}

describe('useDeleteOrderNote', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockResolvedValue(undefined)
  })

  // Given a note id
  // When useDeleteOrderNote's mutation runs
  // Then it should DELETE /notes/:id
  it('sends a DELETE request for the given note id', async () => {
    const { result } = renderUseDeleteOrderNote()
    result.current.mutate('note-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.delete).toHaveBeenCalledWith('/notes/note-1')
  })

  // Given a successful deletion
  // When the mutation resolves
  // Then the order notes query should be invalidated so the note disappears
  it('invalidates the order notes query on success', async () => {
    const { result, queryClient } = renderUseDeleteOrderNote()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    result.current.mutate('note-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['order-notes', 'order-1'] })
  })
})

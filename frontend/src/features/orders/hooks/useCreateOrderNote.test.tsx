import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCreateOrderNote } from './useCreateOrderNote'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockNote = {
  id: 'note-1',
  orderId: 'order-1',
  content: 'Hola',
  createdBy: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function renderUseCreateOrderNote() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const { result } = renderHook(() => useCreateOrderNote('order-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { result, queryClient }
}

describe('useCreateOrderNote', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockResolvedValue({ note: mockNote })
  })

  // Given note content
  // When useCreateOrderNote's mutation runs
  // Then it should POST /orders/:id/notes with that content
  it('sends a POST request with the given content', async () => {
    const { result } = renderUseCreateOrderNote()
    result.current.mutate('Hola')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.post).toHaveBeenCalledWith('/orders/order-1/notes', { content: 'Hola' })
  })

  // Given a successful creation
  // When the mutation resolves
  // Then the order notes query should be invalidated so the new note appears
  it('invalidates the order notes query on success', async () => {
    const { result, queryClient } = renderUseCreateOrderNote()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    result.current.mutate('Hola')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['order-notes', 'order-1'] })
  })
})

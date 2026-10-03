import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCreateNote } from './useCreateNote'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockNote = {
  id: 'note-1',
  clientId: 'client-1',
  content: 'Hola',
  createdBy: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function renderUseCreateNote() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const { result } = renderHook(() => useCreateNote('client-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { result, queryClient }
}

describe('useCreateNote', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockResolvedValue({ note: mockNote })
  })

  // Given note content
  // When useCreateNote's mutation runs
  // Then it should POST /clients/:id/notes with that content
  it('sends a POST request with the given content', async () => {
    const { result } = renderUseCreateNote()
    result.current.mutate('Hola')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.post).toHaveBeenCalledWith('/clients/client-1/notes', { content: 'Hola' })
  })

  // Given a successful creation
  // When the mutation resolves
  // Then the client notes query should be invalidated so the new note appears
  it('invalidates the client notes query on success', async () => {
    const { result, queryClient } = renderUseCreateNote()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    result.current.mutate('Hola')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['client-notes', 'client-1'] })
  })
})

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClientNotes } from './useClientNotes'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockNotes = [
  {
    id: 'note-1',
    clientId: 'client-1',
    content: 'Hola',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

function renderUseClientNotes() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useClientNotes('client-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useClientNotes', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ notes: mockNotes })
  })

  // Given a client id
  // When useClientNotes is called
  // Then it should request GET /clients/:id/notes
  it('requests /clients/:id/notes', async () => {
    const { result } = renderUseClientNotes()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/clients/client-1/notes')
  })

  // Given a successful response
  // When useClientNotes resolves
  // Then it should return the notes, unwrapped from the { notes } envelope
  it('returns the notes from the response', async () => {
    const { result } = renderUseClientNotes()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockNotes)
  })
})

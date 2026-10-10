import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrderNotes } from './useOrderNotes'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockNotes = [
  {
    id: 'note-1',
    orderId: 'order-1',
    content: 'Hola',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

function renderUseOrderNotes() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useOrderNotes('order-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useOrderNotes', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ notes: mockNotes })
  })

  // Given an order id
  // When useOrderNotes is called
  // Then it should request GET /orders/:id/notes
  it('requests /orders/:id/notes', async () => {
    const { result } = renderUseOrderNotes()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/orders/order-1/notes')
  })

  // Given a successful response
  // When useOrderNotes resolves
  // Then it should return the notes, unwrapped from the { notes } envelope
  it('returns the notes from the response', async () => {
    const { result } = renderUseOrderNotes()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockNotes)
  })
})

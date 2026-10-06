import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTags } from './useTags'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockTags = [
  { id: 'tag-1', name: 'Nuevo cliente', color: '#3b91ff', priority: 'LOW', isDefault: true },
]

function renderUseTags() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useTags(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useTags', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ tags: mockTags })
  })

  // Given the tags endpoint
  // When useTags is called
  // Then it should request GET /tags
  it('requests /tags', async () => {
    const { result } = renderUseTags()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/tags')
  })

  // Given a successful response
  // When useTags resolves
  // Then it should return the tags array, unwrapped from the { tags } envelope
  it('returns the tags array from the response', async () => {
    const { result } = renderUseTags()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockTags)
  })
})

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearchClients } from './useSearchClients'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const clients = [{ id: 'client-1', name: 'Laura García', email: 'laura@ejemplo.test', phone: null }]

function renderUseSearchClients() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return renderHook(() => useSearchClients(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useSearchClients', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given a search text with spaces and accents
  // When the search is run
  // Then it should request /clients with the text URL-encoded, capped to 5 results, and return the data
  it('requests /clients with the encoded search text and a limit of 5', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: clients })
    const { result } = renderUseSearchClients()

    result.current.mutate('Laura García')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/clients?search=Laura%20Garc%C3%ADa&limit=5')
    expect(result.current.data).toEqual(clients)
  })

  // Given the backend fails
  // When the search is run
  // Then the hook should expose the error
  it('exposes the error when the request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('boom'))
    const { result } = renderUseSearchClients()

    result.current.mutate('Laura')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

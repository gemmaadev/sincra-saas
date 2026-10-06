import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAddressSearch } from './useAddressSearch'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const candidates = [
  {
    label: 'Carrer de Balmes, Manresa, Catalunya, Espanya',
    address: 'Carrer de Balmes',
    zone: 'Manresa',
    latitude: 41.7346709,
    longitude: 1.8302486,
  },
]

function renderUseAddressSearch() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return renderHook(() => useAddressSearch(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useAddressSearch', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given a search text with spaces, a comma and accents
  // When the search is run
  // Then it should request /clients/address-search with the text URL-encoded and return the candidates
  it('requests the address search with the encoded text', async () => {
    vi.mocked(api.get).mockResolvedValue({ candidates })
    const { result } = renderUseAddressSearch()

    result.current.mutate('Carrer de Balmes 71, Manresa')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith(
      '/clients/address-search?q=Carrer%20de%20Balmes%2071%2C%20Manresa',
    )
    expect(result.current.data).toEqual(candidates)
  })

  // Given the backend fails
  // When the search is run
  // Then the hook should expose the error
  it('exposes the error when the request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('boom'))
    const { result } = renderUseAddressSearch()

    result.current.mutate('Rambla Nova')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

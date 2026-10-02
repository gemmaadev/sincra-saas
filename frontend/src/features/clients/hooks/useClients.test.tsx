import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClients } from './useClients'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockResponse = {
  data: [{ id: 'client-1', name: 'Laura García' }],
  pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
}

function renderUseClients(params?: Parameters<typeof useClients>[0]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useClients(params), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useClients', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue(mockResponse)
  })

  // Given no filters
  // When useClients is called
  // Then it should request /clients with no query string
  it('requests /clients with no query string when called without params', async () => {
    const { result } = renderUseClients()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/clients')
  })

  // Given page, search, channel and tagId filters
  // When useClients is called
  // Then it should build the query string with every filter
  it('builds the query string from every filter', async () => {
    const { result } = renderUseClients({
      page: 2,
      search: 'laura',
      channel: 'GMAIL',
      tagId: 'tag-1',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/clients?page=2&search=laura&channel=GMAIL&tagId=tag-1')
  })

  // Given a successful response
  // When useClients resolves
  // Then it should return the data and pagination from the API
  it('returns the clients and pagination from the API response', async () => {
    const { result } = renderUseClients()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })
})

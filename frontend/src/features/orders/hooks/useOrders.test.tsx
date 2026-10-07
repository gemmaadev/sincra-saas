import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrders } from './useOrders'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockResponse = {
  data: [{ id: 'order-1', number: 1 }],
  pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
}

function renderUseOrders(params?: Parameters<typeof useOrders>[0]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useOrders(params), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useOrders', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue(mockResponse)
  })

  // Given no filters
  // When useOrders is called
  // Then it should request /orders with no query string
  it('requests /orders with no query string when called without params', async () => {
    const { result } = renderUseOrders()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/orders')
  })

  // Given page, status, channel, date range and search filters
  // When useOrders is called
  // Then it should build the query string with every filter
  it('builds the query string from every filter', async () => {
    const { result } = renderUseOrders({
      page: 2,
      status: 'PENDING',
      channel: 'GMAIL',
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      search: 'camiseta',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith(
      '/orders?page=2&status=PENDING&channel=GMAIL&dateFrom=2026-01-01&dateTo=2026-01-31&search=camiseta',
    )
  })

  // Given a successful response
  // When useOrders resolves
  // Then it should return the orders and pagination from the API response
  it('returns the orders and pagination from the API response', async () => {
    const { result } = renderUseOrders()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })
})

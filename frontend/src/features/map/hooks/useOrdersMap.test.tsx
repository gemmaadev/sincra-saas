import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrdersMap } from './useOrdersMap'
import { api } from '@/shared/services'
import type { OrderMapResponse } from '../types/map.types'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockResponse: OrderMapResponse = {
  total: 2,
  deliveredRevenue: '100',
  zones: [{ zone: 'Barcelona', count: 1, revenue: '100', percentage: 100 }],
  orders: [],
}

function renderUseOrdersMap(
  filters?: Parameters<typeof useOrdersMap>[0],
  enabled?: Parameters<typeof useOrdersMap>[1],
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const hook = renderHook(() => useOrdersMap(filters, enabled), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...hook, queryClient }
}

describe('useOrdersMap', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue(mockResponse)
  })

  // Given no filters
  // When useOrdersMap is called
  // Then it should request /orders/map with no query string and return the response
  it('requests /orders/map with no query string when called without filters', async () => {
    const { result } = renderUseOrdersMap()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith('/orders/map')
    expect(result.current.data).toEqual(mockResponse)
  })

  // Given channel and date filters
  // When useOrdersMap is called
  // Then it should send them in the query string, without "type" (orders have no such filter)
  it('builds the query string from channel and date filters only', async () => {
    const { result } = renderUseOrdersMap({
      channel: 'WHATSAPP',
      type: 'Panadería',
      from: '2026-01-01',
      to: '2026-01-31',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = vi.mocked(api.get).mock.calls[0][0] as string
    const params = new URLSearchParams(calledUrl.split('?')[1])
    expect(calledUrl.startsWith('/orders/map?')).toBe(true)
    expect(params.get('channel')).toBe('WHATSAPP')
    expect(params.has('type')).toBe(false)
    expect(params.get('from')).toBe('2026-01-01')
    expect(params.get('to')).toBe('2026-01-31')
  })

  // Given the hook is called with enabled set to false
  // When the component renders
  // Then it should not request /orders/map at all
  it('does not fetch when disabled', () => {
    renderUseOrdersMap(undefined, false)

    expect(api.get).not.toHaveBeenCalled()
  })

  // Given the hook has loaded
  // When the cache is inspected
  // Then the key should start with 'orders' so order mutations refresh the map too
  it('stores the data under a key that starts with orders', async () => {
    const { result, queryClient } = renderUseOrdersMap({ channel: 'GMAIL' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(['orders', 'map', { channel: 'GMAIL' }])).toEqual(mockResponse)
  })
})

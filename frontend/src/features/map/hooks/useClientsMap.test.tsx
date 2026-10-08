import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClientsMap } from './useClientsMap'
import { api } from '@/shared/services'
import type { ClientMapResponse } from '../types/map.types'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockResponse: ClientMapResponse = {
  total: 1,
  clients: [
    {
      id: 'client-1',
      name: 'Laura García',
      latitude: 41.3851,
      longitude: 2.1734,
      zone: 'Barcelona',
      channels: ['GMAIL'],
      type: null,
      approximate: false,
      orderCount: 0,
      deliveredRevenue: '0',
    },
  ],
  zones: [{ zone: 'Barcelona', count: 1, percentage: 100 }],
  channelOrigin: [{ channel: 'GMAIL', count: 1, percentage: 100 }],
}

function renderUseClientsMap(filters?: Parameters<typeof useClientsMap>[0]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const hook = renderHook(() => useClientsMap(filters), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...hook, queryClient }
}

describe('useClientsMap', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue(mockResponse)
  })

  // Given no filters
  // When useClientsMap is called
  // Then it should request /clients/map with no query string and return the response
  it('requests /clients/map with no query string when called without filters', async () => {
    const { result } = renderUseClientsMap()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith('/clients/map')
    expect(result.current.data).toEqual(mockResponse)
  })

  // Given channel, type and date filters
  // When useClientsMap is called
  // Then it should send every filter in the query string
  it('builds the query string from every filter', async () => {
    const { result } = renderUseClientsMap({
      channel: 'WHATSAPP',
      type: 'Panadería',
      from: '2026-01-01',
      to: '2026-01-31',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = vi.mocked(api.get).mock.calls[0][0] as string
    const params = new URLSearchParams(calledUrl.split('?')[1])
    expect(calledUrl.startsWith('/clients/map?')).toBe(true)
    expect(params.get('channel')).toBe('WHATSAPP')
    expect(params.get('type')).toBe('Panadería')
    expect(params.get('from')).toBe('2026-01-01')
    expect(params.get('to')).toBe('2026-01-31')
  })

  // Given the hook has loaded
  // When the cache is inspected
  // Then the key should start with 'clients' so client mutations refresh the map too
  it('stores the data under a key that starts with clients', async () => {
    const { result, queryClient } = renderUseClientsMap({ channel: 'GMAIL' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(['clients', 'map', { channel: 'GMAIL' }])).toEqual(mockResponse)
  })
})

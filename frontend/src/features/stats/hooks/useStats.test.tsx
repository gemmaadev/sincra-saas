import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStats } from './useStats'
import { api } from '@/shared/services'
import type { StatsDashboard } from '../types/stats.types'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockDashboard: StatsDashboard = {
  overview: { newClients: 5, ordersCreated: 12, averageDeliveryDays: 2.5, revenue: '150' },
  ordersByStatus: {
    total: 10,
    statuses: [{ status: 'PENDING', count: 3, percentage: 30 }],
  },
  ordersEvolution: {
    granularity: 'daily',
    points: [{ date: '2026-10-01', count: 3 }],
  },
  clientsByType: {
    total: 5,
    types: [{ type: 'particular', count: 5, percentage: 100 }],
  },
  aiSummary: { clientsDetected: 2, ordersDetected: 4 },
}

function renderUseStats(filters: Parameters<typeof useStats>[0] = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useStats(filters), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useStats', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue(mockDashboard)
  })

  // Given no filters
  // When useStats is called
  // Then it should request /stats/dashboard with no query string and return the response
  it('requests /stats/dashboard with no query string when called without filters', async () => {
    const { result } = renderUseStats()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith('/stats/dashboard')
    expect(result.current.data).toEqual(mockDashboard)
  })

  // Given a date range and granularity
  // When useStats is called
  // Then it should send them all in the query string
  it('builds the query string from the date range and granularity', async () => {
    const { result } = renderUseStats({
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      granularity: 'weekly',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = vi.mocked(api.get).mock.calls[0][0] as string
    const params = new URLSearchParams(calledUrl.split('?')[1])
    expect(calledUrl.startsWith('/stats/dashboard?')).toBe(true)
    expect(params.get('dateFrom')).toBe('2026-10-01')
    expect(params.get('dateTo')).toBe('2026-10-31')
    expect(params.get('granularity')).toBe('weekly')
  })
})

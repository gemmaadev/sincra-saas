import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCalendarEvents } from './useCalendarEvents'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockEvents = [
  {
    id: 'event-1',
    title: 'Llamar a Juan',
    description: null,
    date: '2026-10-15T10:00:00.000Z',
    source: 'MANUAL',
    clientId: 'client-1',
    clientName: 'Juan',
    orderId: null,
    orderLabel: null,
    editable: true,
  },
]

function renderUseCalendarEvents(filters: Parameters<typeof useCalendarEvents>[0]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useCalendarEvents(filters), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useCalendarEvents', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })
  })

  // Given a date range
  // When useCalendarEvents is called
  // Then it should request /calendar with dateFrom and dateTo in the query string
  it('requests /calendar with the given date range', async () => {
    const { result } = renderUseCalendarEvents({
      dateFrom: '2026-10-01T00:00:00.000Z',
      dateTo: '2026-10-31T00:00:00.000Z',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith(
      '/calendar?dateFrom=2026-10-01T00%3A00%3A00.000Z&dateTo=2026-10-31T00%3A00%3A00.000Z',
    )
  })

  // Given a successful response
  // When useCalendarEvents resolves
  // Then it should return the events array, not the wrapping object
  it('returns the events array from the API response', async () => {
    const { result } = renderUseCalendarEvents({
      dateFrom: '2026-10-01T00:00:00.000Z',
      dateTo: '2026-10-31T00:00:00.000Z',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockEvents)
  })
})

import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useRescheduleCalendarEvent } from './useRescheduleCalendarEvent'

vi.mock('@/shared/services', () => ({
  api: { patch: vi.fn() },
}))

function renderRescheduleCalendarEvent() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useRescheduleCalendarEvent(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useRescheduleCalendarEvent', () => {
  beforeEach(() => {
    vi.mocked(api.patch)
      .mockReset()
      .mockResolvedValue({ event: { id: 'event-1' } })
  })

  // Given an event id and a new date range
  // When the mutation runs
  // Then it should PATCH the reschedule endpoint and refresh the calendar query
  it('reschedules the event and invalidates the calendar query', async () => {
    const { result, invalidateQueries } = renderRescheduleCalendarEvent()

    await act(async () => {
      await result.current.mutateAsync({
        eventId: 'event-1',
        date: '2026-10-17T10:00:00.000Z',
        endDate: '2026-10-17T11:00:00.000Z',
      })
    })

    expect(api.patch).toHaveBeenCalledWith('/calendar/event-1/reschedule', {
      date: '2026-10-17T10:00:00.000Z',
      endDate: '2026-10-17T11:00:00.000Z',
    })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should still refresh the calendar query, to resync with the server
  it('still refreshes the calendar query when the request fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderRescheduleCalendarEvent()

    await act(async () => {
      await result.current
        .mutateAsync({ eventId: 'event-1', date: '2026-10-17T10:00:00.000Z', endDate: '2026-10-17T11:00:00.000Z' })
        .catch(() => undefined)
    })

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })

  // Given an event already in the calendar query's cache
  // When the mutation is triggered (before the request resolves)
  // Then its date and endDate should be updated in the cache immediately
  it('optimistically moves the event in the cache before the request resolves', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const queryKey = ['calendar', 'events', { dateFrom: '2026-10-01', dateTo: '2026-10-31' }]
    queryClient.setQueryData(queryKey, [
      { id: 'event-1', date: '2026-10-15T10:00:00.000Z', endDate: '2026-10-15T11:00:00.000Z' },
    ])
    vi.mocked(api.patch).mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useRescheduleCalendarEvent(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })

    await act(async () => {
      result.current.mutate({
        eventId: 'event-1',
        date: '2026-10-17T10:00:00.000Z',
        endDate: '2026-10-17T11:00:00.000Z',
      })
    })

    expect(queryClient.getQueryData(queryKey)).toEqual([
      { id: 'event-1', date: '2026-10-17T10:00:00.000Z', endDate: '2026-10-17T11:00:00.000Z' },
    ])
  })

  // Given an optimistically moved event
  // When the request then fails
  // Then the cache should roll back to the event's original date and endDate
  it('rolls back the cache when the request fails', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const queryKey = ['calendar', 'events', { dateFrom: '2026-10-01', dateTo: '2026-10-31' }]
    queryClient.setQueryData(queryKey, [
      { id: 'event-1', date: '2026-10-15T10:00:00.000Z', endDate: '2026-10-15T11:00:00.000Z' },
    ])
    vi.mocked(api.patch).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useRescheduleCalendarEvent(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })

    await act(async () => {
      await result.current
        .mutateAsync({
          eventId: 'event-1',
          date: '2026-10-17T10:00:00.000Z',
          endDate: '2026-10-17T11:00:00.000Z',
        })
        .catch(() => undefined)
    })

    expect(queryClient.getQueryData(queryKey)).toEqual([
      { id: 'event-1', date: '2026-10-15T10:00:00.000Z', endDate: '2026-10-15T11:00:00.000Z' },
    ])
  })
})

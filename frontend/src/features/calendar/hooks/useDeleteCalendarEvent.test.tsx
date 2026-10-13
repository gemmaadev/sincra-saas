import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useDeleteCalendarEvent } from './useDeleteCalendarEvent'

vi.mock('@/shared/services', () => ({
  api: { delete: vi.fn() },
}))

function renderDeleteCalendarEvent(eventId = 'event-1') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useDeleteCalendarEvent(eventId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useDeleteCalendarEvent', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
  })

  // Given an event id
  // When the mutation runs
  // Then it should DELETE that event and refresh the calendar query
  it('deletes the event and invalidates the calendar query', async () => {
    const { result, invalidateQueries } = renderDeleteCalendarEvent('event-1')

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(api.delete).toHaveBeenCalledWith('/calendar/event-1')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh the query
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.delete).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderDeleteCalendarEvent()

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

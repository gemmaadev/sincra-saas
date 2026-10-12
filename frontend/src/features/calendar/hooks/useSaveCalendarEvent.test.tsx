import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useSaveCalendarEvent } from './useSaveCalendarEvent'
import type { CalendarEventFormValues } from '../types/calendar.types'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn(), patch: vi.fn() },
}))

const values: CalendarEventFormValues = {
  title: 'Llamar a Juan',
  date: '2026-10-15',
  time: '10:00',
  description: '',
  linkType: 'none',
  clientId: '',
  clientName: '',
  orderId: '',
  orderLabel: '',
}

function renderSaveCalendarEvent(eventId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useSaveCalendarEvent(eventId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useSaveCalendarEvent', () => {
  beforeEach(() => {
    vi.mocked(api.post)
      .mockReset()
      .mockResolvedValue({ event: { id: 'event-9' } })
    vi.mocked(api.patch)
      .mockReset()
      .mockResolvedValue({ event: { id: 'event-1' } })
  })

  // Given no event id
  // When the mutation runs
  // Then it should POST to /calendar and refresh the calendar query
  it('creates an event and invalidates the calendar query', async () => {
    const { result, invalidateQueries } = renderSaveCalendarEvent()

    await act(async () => {
      await result.current.mutateAsync(values)
    })

    expect(api.post).toHaveBeenCalledWith(
      '/calendar',
      expect.objectContaining({ title: 'Llamar a Juan' }),
    )
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })

  // Given an event id
  // When the mutation runs
  // Then it should PATCH that event and refresh the calendar query
  it('updates an event and invalidates the calendar query', async () => {
    const { result, invalidateQueries } = renderSaveCalendarEvent('event-1')

    await act(async () => {
      await result.current.mutateAsync(values)
    })

    expect(api.patch).toHaveBeenCalledWith(
      '/calendar/event-1',
      expect.objectContaining({ title: 'Llamar a Juan' }),
    )
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should not refresh any query
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderSaveCalendarEvent()

    await act(async () => {
      await result.current.mutateAsync(values).catch(() => undefined)
    })

    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

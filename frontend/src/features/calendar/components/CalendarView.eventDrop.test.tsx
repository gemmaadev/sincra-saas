import { render, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { CalendarView } from './CalendarView'

// FullCalendar's eventDrop fires from real pointer drag physics (mousedown/move/up with
// geometry-based hit testing), which jsdom can't compute — every element reports zero size.
// So instead of simulating a real drag, we mock FullCalendar itself to capture the props it
// was given, then call its `eventDrop` prop directly with a fake drop event.
let capturedProps: Record<string, unknown> = {}

vi.mock('@fullcalendar/react', () => ({
  default: (props: Record<string, unknown>) => {
    capturedProps = props
    return null
  },
}))
vi.mock('@fullcalendar/daygrid', () => ({ default: {} }))
vi.mock('@fullcalendar/timegrid', () => ({ default: {} }))
vi.mock('@fullcalendar/interaction', () => ({ default: {} }))
vi.mock('@fullcalendar/core/locales/es', () => ({ default: {} }))
vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const manualEvent = {
  id: 'event-1',
  title: 'Llamar a Juan',
  description: null,
  date: '2026-10-15T10:00:00',
  endDate: '2026-10-15T11:00:00',
  source: 'MANUAL',
  clientId: null,
  clientName: null,
  orderId: null,
  orderLabel: null,
  orderNumber: null,
  editable: true,
}

const ZERO_DELTA = { years: 0, months: 0, days: 0, milliseconds: 0 }

function renderCalendarView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <CalendarView onDateClick={vi.fn()} onEventClick={vi.fn()} />
    </QueryClientProvider>,
  )
}

async function simulateEventDrop(eventId: string, delta: typeof ZERO_DELTA, revert = vi.fn()) {
  await act(async () => {
    ;(capturedProps.eventDrop as (arg: unknown) => void)({ event: { id: eventId }, delta, revert })
  })
  return revert
}

describe('CalendarView eventDrop', () => {
  beforeEach(() => {
    capturedProps = {}
    vi.mocked(api.get).mockReset().mockResolvedValue({ events: [manualEvent] })
    vi.mocked(api.patch).mockReset().mockResolvedValue({ event: { id: 'event-1' } })
  })

  // Given a manual event shown on the calendar
  // When it's dropped one day later
  // Then it should reschedule it via PATCH, shifting both date and endDate by that delta
  it('reschedules the dragged event, shifting date and endDate by the drop delta', async () => {
    renderCalendarView()
    await waitFor(() => expect((capturedProps.events as unknown[]).length).toBeGreaterThan(0))

    await simulateEventDrop('event-1', { ...ZERO_DELTA, days: 1 })

    const expectedDate = new Date(2026, 9, 16, 10, 0, 0).toISOString()
    const expectedEndDate = new Date(2026, 9, 16, 11, 0, 0).toISOString()
    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/calendar/event-1/reschedule', {
        date: expectedDate,
        endDate: expectedEndDate,
      }),
    )
  })

  // Given a manual event is dropped successfully
  // When the backend confirms the reschedule
  // Then the drop should not be reverted
  it('does not revert the drop when the backend request succeeds', async () => {
    renderCalendarView()
    await waitFor(() => expect((capturedProps.events as unknown[]).length).toBeGreaterThan(0))

    const revert = await simulateEventDrop('event-1', { ...ZERO_DELTA, days: 1 })

    await waitFor(() => expect(api.patch).toHaveBeenCalled())
    expect(revert).not.toHaveBeenCalled()
  })

  // Given the backend rejects the reschedule request
  // When an event is dropped
  // Then the drop should be reverted visually
  it('reverts the drop when the backend request fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('boom'))
    renderCalendarView()
    await waitFor(() => expect((capturedProps.events as unknown[]).length).toBeGreaterThan(0))

    const revert = await simulateEventDrop('event-1', { ...ZERO_DELTA, days: 1 })

    await waitFor(() => expect(revert).toHaveBeenCalledOnce())
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CalendarView } from './CalendarView'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

function todayAt(hour: number): string {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const manualEvent = {
  id: 'event-1',
  title: 'Llamar a Juan',
  description: null,
  date: todayAt(10),
  source: 'MANUAL',
  clientId: 'client-1',
  clientName: 'Juan',
  orderId: null,
  orderLabel: null,
  orderNumber: null,
  editable: true,
}

const orderEvent = {
  id: 'order-1',
  title: '#42 - Laura',
  description: null,
  date: todayAt(16),
  source: 'ORDER',
  clientId: 'client-2',
  clientName: 'Laura',
  orderId: 'order-1',
  orderLabel: 'Pedido #42 - Laura',
  orderNumber: 42,
  editable: false,
}

function renderCalendarView(
  overrides: Partial<React.ComponentProps<typeof CalendarView>> = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onDateClick = vi.fn()
  const onEventClick = vi.fn()
  const view = render(
    <QueryClientProvider client={queryClient}>
      <CalendarView onDateClick={onDateClick} onEventClick={onEventClick} {...overrides} />
    </QueryClientProvider>,
  )
  return { ...view, onDateClick, onEventClick }
}

describe('CalendarView', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ events: [manualEvent, orderEvent] })
  })

  // Given a manual follow-up and an order, both due today
  // When CalendarView renders
  // Then both should appear on the calendar grid
  it('renders the events returned by the API', async () => {
    renderCalendarView()

    expect((await screen.findAllByText('Llamar a Juan')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('#42 - Laura').length).toBeGreaterThan(0)
  })

  // Given both event types are loaded
  // When the user unchecks "Entrega pedido" in the type filter
  // Then the order event should disappear while the manual one stays
  it('hides a type of event when its filter is unchecked', async () => {
    const user = userEvent.setup()
    renderCalendarView()

    await screen.findAllByText('Llamar a Juan')

    await user.click(screen.getByRole('button', { name: /Filtrar/ }))
    await user.click(screen.getByLabelText('Entrega pedido'))

    await waitFor(() => expect(screen.queryAllByText('#42 - Laura')).toHaveLength(0))
    expect(screen.getAllByText('Llamar a Juan').length).toBeGreaterThan(0)
  })

  // dateClick isn't covered here: FullCalendar resolves which day was clicked via geometry
  // (getBoundingClientRect-based hit testing), which jsdom doesn't compute — every element has
  // zero size, so a simulated click never resolves to a date in this environment. eventClick
  // below works because it fires directly off the clicked event element, no geometry involved.

  // Given an editable (manual) event is shown
  // When the user clicks it
  // Then onEventClick should be called with that event
  it('calls onEventClick when an editable event is clicked', async () => {
    const user = userEvent.setup()
    const { onEventClick } = renderCalendarView()

    const [eventChip] = await screen.findAllByText('Llamar a Juan')
    await user.click(eventChip as Element)

    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'event-1' }))
  })

  // Given a non-editable order delivery is shown
  // When the user clicks it
  // Then onEventClick should still be called, so its details can be previewed read-only
  it('calls onEventClick for a non-editable order delivery too', async () => {
    const user = userEvent.setup()
    const { onEventClick } = renderCalendarView()

    const [eventChip] = await screen.findAllByText('#42 - Laura')
    await user.click(eventChip as Element)

    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-1' }))
  })
})

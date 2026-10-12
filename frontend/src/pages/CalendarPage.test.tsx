import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CalendarPage from './CalendarPage'
import { api } from '@/shared/services'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

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

function renderCalendarPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <CalendarPage />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ events: [manualEvent] })
  })

  // Given calendar events returned by the API
  // When CalendarPage is rendered
  // Then they should appear on the calendar grid
  it('renders the events returned by the API', async () => {
    renderCalendarPage()

    expect((await screen.findAllByText('Llamar a Juan')).length).toBeGreaterThan(0)
  })

  // Given the calendar page
  // When the user clicks "Nuevo evento"
  // Then the create event modal should open
  it('opens the create modal when "Nuevo evento" is clicked', async () => {
    const user = userEvent.setup()
    renderCalendarPage()

    await user.click(screen.getByRole('button', { name: /Nuevo evento/ }))

    expect(await screen.findByRole('dialog', { name: 'Nuevo evento' })).toBeInTheDocument()
  })

  // Given an existing event on the calendar
  // When the user clicks it
  // Then the read-only preview should open first, showing its details
  it('opens the preview, not the edit form, when an event is clicked', async () => {
    const user = userEvent.setup()
    renderCalendarPage()

    const [eventChip] = await screen.findAllByText('Llamar a Juan')
    await user.click(eventChip as Element)

    expect(await screen.findByRole('dialog', { name: 'Llamar a Juan' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Título del evento')).not.toBeInTheDocument()
  })

  // Given the preview of an editable event is open
  // When the user clicks "Editar"
  // Then the edit form should open, prefilled with that event's data
  it('opens the edit form, prefilled, from the preview', async () => {
    const user = userEvent.setup()
    renderCalendarPage()

    const [eventChip] = await screen.findAllByText('Llamar a Juan')
    await user.click(eventChip as Element)
    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(await screen.findByRole('dialog', { name: 'Editar evento' })).toBeInTheDocument()
    expect(screen.getByLabelText('Título del evento')).toHaveValue('Llamar a Juan')
  })

  // Given the preview of an editable event is open
  // When the user deletes it and confirms
  // Then it should disappear from both the calendar grid and "Próximos eventos"
  it('removes the event from the calendar after deleting it from the preview', async () => {
    const user = userEvent.setup()
    let events = [manualEvent]
    vi.mocked(api.get).mockImplementation(async () => ({ events }))
    vi.mocked(api.delete).mockImplementation(async () => {
      events = []
    })

    renderCalendarPage()

    const [eventChip] = await screen.findAllByText('Llamar a Juan')
    await user.click(eventChip as Element)
    await user.click(await screen.findByRole('button', { name: 'Eliminar' }))
    await user.click(await screen.findByRole('button', { name: 'Eliminar' }))

    expect(api.delete).toHaveBeenCalledWith('/calendar/event-1')
    await waitFor(() => expect(screen.queryAllByText('Llamar a Juan')).toHaveLength(0))
  })
})

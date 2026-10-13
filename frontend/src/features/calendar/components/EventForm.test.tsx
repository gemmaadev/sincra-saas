import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { EventForm } from './EventForm'
import type { CalendarItem } from '../types/calendar.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn() } }
})

const mockEvent: CalendarItem = {
  id: 'event-1',
  title: 'Llamar a Juan',
  description: 'Confirmar talla',
  date: '2026-10-15T10:00:00',
  endDate: '2026-10-15T11:00:00',
  source: 'MANUAL',
  clientId: 'client-1',
  clientName: 'Juan',
  orderId: null,
  orderLabel: null,
  orderNumber: null,
  editable: true,
}

function renderForm(props: Partial<React.ComponentProps<typeof EventForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(withQueryClient(<EventForm onSubmit={onSubmit} onCancel={onCancel} {...props} />))
  return { onSubmit, onCancel, user: userEvent.setup() }
}

describe('EventForm', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given an empty create form
  // When the user submits it without a title
  // Then the title error should be shown and nothing should be submitted
  it('requires a title', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Fecha'), '2026-10-15')
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findAllByText('Obligatorio')).not.toHaveLength(0)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given a title but no date
  // When the user submits the form
  // Then the date error should be shown and nothing should be submitted
  it('requires a date', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan')
    await user.clear(screen.getByLabelText('Fecha'))
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findAllByText('Obligatorio')).not.toHaveLength(0)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given a valid title and date
  // When the user submits the form
  // Then onSubmit should receive the form values
  it('submits the form values', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan')
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      title: 'Llamar a Juan',
      linkType: 'none',
    })
  })

  // Given a title and a start, but no end time
  // When the user submits the form
  // Then the end time error should be shown and nothing should be submitted
  it('requires an end time', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan')
    await user.clear(screen.getByLabelText('Hora fin'))
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findAllByText('Obligatorio')).not.toHaveLength(0)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given an end time earlier than the start time, on the same day
  // When the user submits the form
  // Then the range error should be shown and nothing should be submitted
  it('rejects an end earlier than the start', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan')
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '11:00' } })
    fireEvent.change(screen.getByLabelText('Hora fin'), { target: { value: '10:00' } })
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findAllByText('No puede ser anterior al inicio')).not.toHaveLength(0)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given an end date on a later day than the start
  // When the user submits the form
  // Then it should be accepted, since events can span multiple days
  it('allows the end to be on a later day', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan')
    await user.clear(screen.getByLabelText('Fecha fin'))
    await user.type(screen.getByLabelText('Fecha fin'), '2026-10-20')
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ endDate: '2026-10-20' })
  })

  // Given an existing event
  // When the form is rendered
  // Then it should be prefilled and the submit button should say "Guardar cambios"
  it('prefills the form when editing an event', () => {
    renderForm({ event: mockEvent })

    expect(screen.getByLabelText('Título del evento')).toHaveValue('Llamar a Juan')
    expect(screen.getByLabelText('Descripción (opcional)')).toHaveValue('Confirmar talla')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  // Given an existing event with a different end date/time
  // When the form is rendered
  // Then the end fields should be prefilled from the event, not from the start
  it('prefills the end date and time from an existing event', () => {
    renderForm({ event: mockEvent })

    expect(screen.getByLabelText('Fecha fin')).toHaveValue('2026-10-15')
    expect(screen.getByLabelText('Hora fin')).toHaveValue('11:00')
  })

  // Given an event linked to a client
  // When the form is rendered
  // Then the link toggle should start on "Cliente" with the client shown as a chip
  it('prefills the link type and client from an existing event', () => {
    renderForm({ event: mockEvent })

    expect(screen.getByRole('button', { name: 'Cliente' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Juan')).toBeInTheDocument()
  })

  // Given the parent passed a submit error
  // When the form is rendered
  // Then the error should be shown
  it('shows the submit error', () => {
    renderForm({ submitError: 'No se ha podido guardar el evento.' })

    expect(screen.getByText('No se ha podido guardar el evento.')).toBeInTheDocument()
  })

  // Given the link type toggle
  // When the user switches from "Cliente" (with a selection) to "Ninguno"
  // Then the client chip should disappear
  it('clears the selection when switching link type', async () => {
    const { user } = renderForm({ event: mockEvent })

    expect(screen.getByText('Juan')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ninguno' }))

    expect(screen.queryByText('Juan')).not.toBeInTheDocument()
  })
})

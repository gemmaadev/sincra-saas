import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { EventFormModal } from './EventFormModal'
import type { CalendarItem } from '../types/calendar.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

const mockEvent: CalendarItem = {
  id: 'event-1',
  title: 'Llamar a Juan',
  description: null,
  date: '2026-10-15T10:00:00.000Z',
  endDate: '2026-10-15T11:00:00.000Z',
  source: 'MANUAL',
  clientId: null,
  clientName: null,
  orderId: null,
  orderLabel: null,
  orderNumber: null,
  editable: true,
}

function renderModal(props: Partial<React.ComponentProps<typeof EventFormModal>> = {}) {
  const onClose = vi.fn()
  render(
    withQueryClient(
      <MantineProvider>
        <EventFormModal opened onClose={onClose} {...props} />
      </MantineProvider>,
    ),
  )
  return { onClose: props.onClose ?? onClose, user: userEvent.setup() }
}

describe('EventFormModal', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
    vi.mocked(api.patch).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given no event is passed
  // When the modal is opened
  // Then it should be in create mode, titled "Nuevo evento"
  it('shows the create title when there is no event', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Nuevo evento' })).toBeInTheDocument()
  })

  // Given an existing event is passed
  // When the modal is opened
  // Then it should be in edit mode, titled "Editar evento"
  it('shows the edit title when an event is passed', () => {
    renderModal({ event: mockEvent })
    expect(screen.getByRole('dialog', { name: 'Editar evento' })).toBeInTheDocument()
  })

  // Given the modal is open
  // When the user clicks the close button
  // Then onClose should be called
  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Given the modal is closed
  // When it is rendered
  // Then nothing should be shown
  it('renders nothing when it is not opened', () => {
    renderModal({ opened: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // Given a valid new event
  // When the user fills the title and submits
  // Then the event should be created and the modal closed
  it('creates the event and closes the modal', async () => {
    vi.mocked(api.post).mockResolvedValue({ event: mockEvent })
    const { onClose, user } = renderModal()

    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan')
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(notifySuccess).toHaveBeenCalledWith('Evento creado')
    expect(api.post).toHaveBeenCalledWith(
      '/calendar',
      expect.objectContaining({ title: 'Llamar a Juan' }),
    )
  })

  // Given an existing event
  // When the user edits the title and saves
  // Then the event should be updated by id and the modal closed
  it('updates the event and closes the modal', async () => {
    vi.mocked(api.patch).mockResolvedValue({ event: mockEvent })
    const { onClose, user } = renderModal({ event: mockEvent })

    await user.clear(screen.getByLabelText('Título del evento'))
    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan otra vez')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(notifySuccess).toHaveBeenCalledWith('Evento actualizado')
    expect(api.patch).toHaveBeenCalledWith(
      '/calendar/event-1',
      expect.objectContaining({ title: 'Llamar a Juan otra vez' }),
    )
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given the backend rejects the save with a message
  // When the user submits the form
  // Then that message should be shown and the modal should stay open
  it('shows the backend error and stays open when saving fails', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('No se ha podido guardar el evento', 400, 'INVALID_DATE'),
    )
    const { onClose, user } = renderModal()

    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan')
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findByText('No se ha podido guardar el evento')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  // Given an unexpected failure that is not an API error
  // When the user submits the form
  // Then a generic error message should be shown
  it('shows a generic error when saving fails unexpectedly', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network down'))
    const { user } = renderModal()

    await user.type(screen.getByLabelText('Título del evento'), 'Llamar a Juan')
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(
      await screen.findByText('No se ha podido guardar el evento. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })

  // Given the form is invalid (no title)
  // When the user submits it
  // Then nothing should be sent to the API
  it('does not call the API when the form is invalid', async () => {
    const { user } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findAllByText('Obligatorio')).not.toHaveLength(0)
    expect(api.post).not.toHaveBeenCalled()
  })
})

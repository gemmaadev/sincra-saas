import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { DeleteEventModal } from './DeleteEventModal'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { delete: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

function renderModal() {
  const onClose = vi.fn()
  const onDeleted = vi.fn()
  render(
    withQueryClient(
      <MantineProvider>
        <DeleteEventModal
          eventId="event-1"
          eventTitle="Llamar a Juan"
          opened
          onClose={onClose}
          onDeleted={onDeleted}
        />
      </MantineProvider>,
    ),
  )
  return { onClose, onDeleted }
}

describe('DeleteEventModal', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given an event to delete
  // When the modal is opened
  // Then it should ask for confirmation naming the event
  it('asks for confirmation naming the event', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: '¿Eliminar evento?' })).toBeInTheDocument()
    expect(screen.getByText(/Vas a eliminar "Llamar a Juan"/)).toBeInTheDocument()
  })

  // Given the confirmation is open
  // When the user confirms
  // Then the event should be deleted, a notification shown and onDeleted called
  it('deletes the event when the user confirms', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)
    const { onDeleted } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1))
    expect(api.delete).toHaveBeenCalledWith('/calendar/event-1')
    expect(notifySuccess).toHaveBeenCalledWith('Evento eliminado')
  })

  // Given the backend rejects the deletion
  // When the user confirms
  // Then the error should be shown and onDeleted not called
  it('shows the error when the deletion fails', async () => {
    vi.mocked(api.delete).mockRejectedValue(
      new ApiError('Evento no encontrado', 404, 'CALENDAR_EVENT_NOT_FOUND'),
    )
    const { onDeleted } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('Evento no encontrado')).toBeInTheDocument()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  // Given the confirmation is open
  // When the user cancels
  // Then onClose should be called and nothing deleted
  it('closes without deleting when the user cancels', () => {
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(api.delete).not.toHaveBeenCalled()
  })
})

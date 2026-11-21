import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { MarkIncidentModal } from './MarkIncidentModal'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { patch: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

function renderModal() {
  const onClose = vi.fn()
  render(
    withQueryClient(
      <MantineProvider>
        <MarkIncidentModal orderId="order-1" opened onClose={onClose} />
      </MantineProvider>,
    ),
  )
  return { onClose }
}

describe('MarkIncidentModal', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue(null)
    vi.mocked(notifySuccess).mockReset()
  })

  // Given the explanation is still empty
  // When the dialog is open
  // Then the confirm button stays disabled
  it('does not allow an empty note', () => {
    renderModal()

    expect(screen.getByRole('button', { name: 'Marcar incidencia' })).toBeDisabled()
  })

  // Given a note about what happened
  // When the person confirms
  // Then the order is marked as an incident with that note
  it('sends the note with the incident status', async () => {
    const { onClose } = renderModal()
    const user = userEvent.setup()

    await user.type(
      screen.getByLabelText('Qué ha pasado'),
      'El cliente ha recibido el pedido dañado',
    )
    await user.click(screen.getByRole('button', { name: 'Marcar incidencia' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/orders/order-1', {
        status: 'INCIDENT',
        incidentNote: 'El cliente ha recibido el pedido dañado',
      }),
    )
    expect(notifySuccess).toHaveBeenCalledWith('Pedido marcado como incidencia')
    expect(onClose).toHaveBeenCalled()
  })

  // Given the server rejects the note
  // When the person confirms
  // Then the server message is shown and the dialog stays open
  it('shows the server error and keeps the dialog open', async () => {
    vi.mocked(api.patch).mockRejectedValue(
      new ApiError('Cuenta qué ha pasado con el pedido', 400, 'MISSING_INCIDENT_NOTE'),
    )
    const { onClose } = renderModal()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Qué ha pasado'), 'Llegó dañado')
    await user.click(screen.getByRole('button', { name: 'Marcar incidencia' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Cuenta qué ha pasado con el pedido')
    expect(onClose).not.toHaveBeenCalled()
  })
})

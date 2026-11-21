import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { ResolveIncidentModal } from './ResolveIncidentModal'

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
        <ResolveIncidentModal
          orderId="order-1"
          resolvedStatus="PREPARING"
          opened
          onClose={onClose}
        />
      </MantineProvider>,
    ),
  )
  return { onClose }
}

describe('ResolveIncidentModal', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue(null)
    vi.mocked(notifySuccess).mockReset()
  })

  // Given the explanation is still empty
  // When the dialog is open
  // Then the confirm button stays disabled
  it('does not allow an empty note', () => {
    renderModal()

    expect(screen.getByRole('button', { name: 'Resolver incidencia' })).toBeDisabled()
  })

  // Given a note about how it was resolved
  // When the person confirms
  // Then the order returns to its paused step with the resolution note
  it('sends the resolution note with the resolved status', async () => {
    const { onClose } = renderModal()
    const user = userEvent.setup()

    await user.type(
      screen.getByLabelText('Cómo se ha resuelto'),
      'Se ha reenviado el pedido y el cliente lo ha confirmado',
    )
    await user.click(screen.getByRole('button', { name: 'Resolver incidencia' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/orders/order-1', {
        status: 'PREPARING',
        resolutionNote: 'Se ha reenviado el pedido y el cliente lo ha confirmado',
      }),
    )
    expect(notifySuccess).toHaveBeenCalledWith('Incidencia resuelta')
    expect(onClose).toHaveBeenCalled()
  })

  // Given the server rejects the note
  // When the person confirms
  // Then the server message is shown and the dialog stays open
  it('shows the server error and keeps the dialog open', async () => {
    vi.mocked(api.patch).mockRejectedValue(
      new ApiError('Cuenta cómo se ha resuelto la incidencia', 400, 'MISSING_RESOLUTION_NOTE'),
    )
    const { onClose } = renderModal()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Cómo se ha resuelto'), 'Se ha reenviado')
    await user.click(screen.getByRole('button', { name: 'Resolver incidencia' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cuenta cómo se ha resuelto la incidencia',
    )
    expect(onClose).not.toHaveBeenCalled()
  })
})

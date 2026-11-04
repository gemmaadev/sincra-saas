import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { CancelOrderModal } from './CancelOrderModal'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { patch: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

function renderModal() {
  const onClose = vi.fn()
  const onCancelled = vi.fn()
  render(
    withQueryClient(
      <MantineProvider>
        <CancelOrderModal
          order={{ id: 'order-1', number: 7 }}
          opened
          onClose={onClose}
          onCancelled={onCancelled}
        />
      </MantineProvider>,
    ),
  )
  return { onClose, onCancelled }
}

describe('CancelOrderModal', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given an order to cancel
  // When the modal is opened
  // Then it should ask for confirmation naming the order
  it('asks for confirmation naming the order', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: '¿Cancelar pedido?' })).toBeInTheDocument()
    expect(screen.getByText(/Vas a cancelar el pedido #7/)).toBeInTheDocument()
  })

  // Given the confirmation is open
  // When the user confirms
  // Then the order's status should be set to CANCELLED, a notification shown and onCancelled called
  it('cancels the order when the user confirms', async () => {
    vi.mocked(api.patch).mockResolvedValue(undefined)
    const { onCancelled } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))

    await waitFor(() => expect(onCancelled).toHaveBeenCalledTimes(1))
    expect(api.patch).toHaveBeenCalledWith('/orders/order-1', { status: 'CANCELLED' })
    expect(notifySuccess).toHaveBeenCalledWith('Pedido cancelado')
  })

  // Given the backend rejects the cancellation
  // When the user confirms
  // Then the error should be shown and onCancelled not called
  it('shows the error when the cancellation fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(
      new ApiError('No se puede cancelar un pedido entregado', 409, 'ORDER_STATUS_FINAL'),
    )
    const { onCancelled } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))

    expect(await screen.findByText('No se puede cancelar un pedido entregado')).toBeInTheDocument()
    expect(onCancelled).not.toHaveBeenCalled()
  })

  // Given the confirmation is open
  // When the user dismisses it instead of confirming
  // Then onClose should be called and nothing cancelled
  it('closes without cancelling when the user dismisses', () => {
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(api.patch).not.toHaveBeenCalled()
  })
})

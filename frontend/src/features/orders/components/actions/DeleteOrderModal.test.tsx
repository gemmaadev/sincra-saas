import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { DeleteOrderModal } from './DeleteOrderModal'

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
        <DeleteOrderModal
          order={{ id: 'order-1', number: 7 }}
          opened
          onClose={onClose}
          onDeleted={onDeleted}
        />
      </MantineProvider>,
    ),
  )
  return { onClose, onDeleted }
}

describe('DeleteOrderModal', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given an order to delete
  // When the modal is opened
  // Then it should ask for confirmation naming the order
  it('asks for confirmation naming the order', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: '¿Eliminar pedido?' })).toBeInTheDocument()
    expect(screen.getByText(/Vas a eliminar el pedido #7/)).toBeInTheDocument()
  })

  // Given the confirmation is open
  // When the user confirms
  // Then the order should be deleted, a notification shown and onDeleted called
  it('deletes the order when the user confirms', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)
    const { onDeleted } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1))
    expect(api.delete).toHaveBeenCalledWith('/orders/order-1')
    expect(notifySuccess).toHaveBeenCalledWith('Pedido eliminado')
  })

  // Given the backend rejects the deletion
  // When the user confirms
  // Then the error should be shown and onDeleted not called
  it('shows the error when the deletion fails', async () => {
    vi.mocked(api.delete).mockRejectedValue(
      new ApiError('Pedido no encontrado', 404, 'ORDER_NOT_FOUND'),
    )
    const { onDeleted } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('Pedido no encontrado')).toBeInTheDocument()
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

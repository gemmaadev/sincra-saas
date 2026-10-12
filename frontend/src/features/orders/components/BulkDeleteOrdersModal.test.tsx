import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { BulkDeleteOrdersModal } from './BulkDeleteOrdersModal'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { delete: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

function renderModal(orderIds: string[]) {
  const onClose = vi.fn()
  const onDeleted = vi.fn()
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <BulkDeleteOrdersModal opened onClose={onClose} orderIds={orderIds} onDeleted={onDeleted} />
      </QueryClientProvider>
    </MantineProvider>,
  )
  return { onClose, onDeleted }
}

describe('BulkDeleteOrdersModal', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
    vi.mocked(notifySuccess).mockReset()
  })

  // Given one selected order
  // When the modal is shown
  // Then the title should use the singular
  it('uses the singular for one order', () => {
    renderModal(['a'])

    expect(screen.getByRole('dialog', { name: '¿Eliminar 1 pedido?' })).toBeInTheDocument()
  })

  // Given several selected orders
  // When the modal is shown
  // Then the title should show how many will be deleted
  it('shows the number of orders in the title', () => {
    renderModal(['a', 'b', 'c'])

    expect(screen.getByRole('dialog', { name: '¿Eliminar 3 pedidos?' })).toBeInTheDocument()
  })

  // Given several selected orders
  // When the user confirms
  // Then every order should be deleted, a notification shown and onDeleted called
  it('deletes every order when the user confirms', async () => {
    const { onDeleted, onClose } = renderModal(['a', 'b', 'c'])

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1))
    expect(api.delete).toHaveBeenCalledTimes(3)
    expect(notifySuccess).toHaveBeenCalledWith('3 pedidos eliminados')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Given one deletion fails
  // When the user confirms
  // Then the modal should stay open with the count of failures and not call onDeleted
  it('keeps the modal open and reports the failures', async () => {
    vi.mocked(api.delete)
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new ApiError('Error', 500, 'INTERNAL_SERVER_ERROR'))
    const { onDeleted, onClose } = renderModal(['a', 'b'])

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(
      await screen.findByText('No se han podido eliminar 1 de 2 pedidos. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
    expect(onDeleted).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  // Given the modal is open
  // When the user cancels
  // Then nothing should be deleted
  it('does not delete anything when the user cancels', () => {
    const { onClose } = renderModal(['a', 'b'])

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(api.delete).not.toHaveBeenCalled()
  })
})

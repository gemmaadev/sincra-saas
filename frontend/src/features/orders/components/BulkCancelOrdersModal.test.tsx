import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { BulkCancelOrdersModal } from './BulkCancelOrdersModal'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { patch: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

function renderModal(orderIds: string[]) {
  const onClose = vi.fn()
  const onCancelled = vi.fn()
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <BulkCancelOrdersModal
          opened
          onClose={onClose}
          orderIds={orderIds}
          onCancelled={onCancelled}
        />
      </QueryClientProvider>
    </MantineProvider>,
  )
  return { onClose, onCancelled }
}

describe('BulkCancelOrdersModal', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue({ order: {} })
    vi.mocked(notifySuccess).mockReset()
  })

  // Given one selected order
  // When the modal is shown
  // Then the title should use the singular
  it('uses the singular for one order', () => {
    renderModal(['a'])

    expect(screen.getByRole('dialog', { name: '¿Cancelar 1 pedido?' })).toBeInTheDocument()
  })

  // Given several selected orders
  // When the modal is shown
  // Then the title should show how many will be cancelled
  it('shows the number of orders in the title', () => {
    renderModal(['a', 'b', 'c'])

    expect(screen.getByRole('dialog', { name: '¿Cancelar 3 pedidos?' })).toBeInTheDocument()
  })

  // Given several selected orders
  // When the user confirms
  // Then every order should be cancelled, a notification shown and onCancelled called
  it('cancels every order when the user confirms', async () => {
    const { onCancelled, onClose } = renderModal(['a', 'b', 'c'])

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedidos' }))

    await waitFor(() => expect(onCancelled).toHaveBeenCalledTimes(1))
    expect(api.patch).toHaveBeenCalledTimes(3)
    expect(notifySuccess).toHaveBeenCalledWith('3 pedidos cancelados')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Given one order cannot be cancelled (e.g. already delivered)
  // When the user confirms
  // Then the modal should stay open with the count of failures and not call onCancelled
  it('keeps the modal open and reports the failures', async () => {
    vi.mocked(api.patch)
      .mockResolvedValueOnce({ order: {} })
      .mockRejectedValueOnce(new ApiError('Estado de pedido no válido', 400, 'ORDER_STATUS_FINAL'))
    const { onCancelled, onClose } = renderModal(['a', 'b'])

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedidos' }))

    expect(
      await screen.findByText(
        'No se han podido cancelar 1 de 2 pedidos. Puede que alguno ya estuviera entregado.',
      ),
    ).toBeInTheDocument()
    expect(onCancelled).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  // Given the modal is open
  // When the user cancels (backs out)
  // Then nothing should be changed
  it('does not cancel anything when the user backs out', () => {
    const { onClose } = renderModal(['a', 'b'])

    fireEvent.click(screen.getByRole('button', { name: /^Cancelar$/ }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(api.patch).not.toHaveBeenCalled()
  })
})

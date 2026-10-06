import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { DeleteClientModal } from './DeleteClientModal'

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
        <DeleteClientModal
          client={{ id: 'client-1', name: 'Laura García' }}
          opened
          onClose={onClose}
          onDeleted={onDeleted}
        />
      </MantineProvider>,
    ),
  )
  return { onClose, onDeleted }
}

describe('DeleteClientModal', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given a client to delete
  // When the modal is opened
  // Then it should ask for confirmation naming the client
  it('asks for confirmation naming the client', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: '¿Eliminar cliente?' })).toBeInTheDocument()
    expect(screen.getByText(/Vas a eliminar a Laura García/)).toBeInTheDocument()
  })

  // Given the confirmation is open
  // When the user confirms
  // Then the client should be deleted, a notification shown and onDeleted called
  it('deletes the client when the user confirms', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)
    const { onDeleted } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1))
    expect(api.delete).toHaveBeenCalledWith('/clients/client-1')
    expect(notifySuccess).toHaveBeenCalledWith('Cliente eliminado')
  })

  // Given the backend rejects the deletion
  // When the user confirms
  // Then the error should be shown and onDeleted not called
  it('shows the error when the deletion fails', async () => {
    vi.mocked(api.delete).mockRejectedValue(
      new ApiError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND'),
    )
    const { onDeleted } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('Cliente no encontrado')).toBeInTheDocument()
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

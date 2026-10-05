import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { ConfirmDeleteModal } from './ConfirmDeleteModal'

function renderModal(props: Partial<React.ComponentProps<typeof ConfirmDeleteModal>> = {}) {
  const onClose = vi.fn()
  const onConfirm = vi.fn()
  render(
    <MantineProvider>
      <ConfirmDeleteModal
        opened
        onClose={onClose}
        onConfirm={onConfirm}
        title="¿Eliminar cliente?"
        message="Esta acción no se puede deshacer."
        {...props}
      />
    </MantineProvider>,
  )
  return { onClose, onConfirm }
}

describe('ConfirmDeleteModal', () => {
  // Given a title and a message
  // When the modal is opened
  // Then both should be shown
  it('shows the title and the message', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: '¿Eliminar cliente?' })).toBeInTheDocument()
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument()
  })

  // Given the modal is open
  // When the user clicks "Eliminar"
  // Then onConfirm should be called and the modal should not close by itself
  it('calls onConfirm when the user confirms', () => {
    const { onConfirm, onClose } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  // Given the modal is open
  // When the user clicks "Cancelar"
  // Then onClose should be called and nothing should be confirmed
  it('calls onClose without confirming when the user cancels', () => {
    const { onConfirm, onClose } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  // Given a custom confirm label
  // When the modal is opened
  // Then the confirm button should use it
  it('uses a custom confirm label', () => {
    renderModal({ confirmLabel: 'Eliminar 5 clientes' })

    expect(screen.getByRole('button', { name: 'Eliminar 5 clientes' })).toBeInTheDocument()
  })

  // Given the deletion is in progress
  // When the modal is shown
  // Then both buttons should be disabled and the confirm one busy
  it('disables the buttons while loading', () => {
    renderModal({ isLoading: true })

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    expect(confirmButton).toBeDisabled()
    expect(confirmButton).toHaveAttribute('aria-busy', 'true')
  })

  // Given the deletion failed
  // When the modal is shown with an error
  // Then the error should be announced
  it('shows the error', () => {
    renderModal({ error: 'No se ha podido eliminar el cliente.' })

    expect(screen.getByRole('alert')).toHaveTextContent('No se ha podido eliminar el cliente.')
  })

  // Given the modal is closed
  // When it is rendered
  // Then nothing should be shown
  it('renders nothing when it is not opened', () => {
    renderModal({ opened: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

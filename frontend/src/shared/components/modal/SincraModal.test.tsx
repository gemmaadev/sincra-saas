import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { SincraModal } from './SincraModal'

function renderModal(props: Partial<React.ComponentProps<typeof SincraModal>> = {}) {
  const onClose = vi.fn()
  render(
    <MantineProvider>
      <SincraModal opened onClose={onClose} title="Título de prueba" {...props}>
        <p>Contenido del modal</p>
      </SincraModal>
    </MantineProvider>,
  )
  return { onClose }
}

describe('SincraModal', () => {
  // Given an opened modal with a title and content
  // When it is rendered
  // Then it should be a dialog named after the title and show its content
  it('shows the title and the content', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: 'Título de prueba' })).toBeInTheDocument()
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
  })

  // Given a modal with an icon
  // When it is rendered
  // Then the icon should be shown next to the title
  it('shows the icon when one is given', () => {
    renderModal({ icon: <svg data-testid="modal-icon" /> })

    expect(screen.getByTestId('modal-icon')).toBeInTheDocument()
  })

  // Given the modal is open
  // When the user clicks the close button
  // Then onClose should be called
  it('calls onClose when the close button is clicked', () => {
    const { onClose } = renderModal()

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
})

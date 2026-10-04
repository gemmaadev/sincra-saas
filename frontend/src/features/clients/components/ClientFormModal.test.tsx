import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { ClientFormModal } from './ClientFormModal'
import type { ClientDetail } from '../types/client.types'

const mockClient: ClientDetail = {
  id: 'client-1',
  name: 'Laura García',
  email: null,
  phone: null,
  channels: ['GMAIL'],
  type: null,
  address: null,
  zone: null,
  latitude: null,
  longitude: null,
  lastContact: null,
  clientTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderModal(props: Partial<React.ComponentProps<typeof ClientFormModal>> = {}) {
  return render(
    <MantineProvider>
      <ClientFormModal opened onClose={vi.fn()} {...props} />
    </MantineProvider>,
  )
}

describe('ClientFormModal', () => {
  // Given no client is passed
  // When the modal is opened
  // Then it should be in create mode, titled "Nuevo cliente"
  it('shows the create title when there is no client', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Nuevo cliente' })).toBeInTheDocument()
  })

  // Given an existing client is passed
  // When the modal is opened
  // Then it should be in edit mode, titled "Editar cliente"
  it('shows the edit title when a client is passed', () => {
    renderModal({ client: mockClient })
    expect(screen.getByRole('dialog', { name: 'Editar cliente' })).toBeInTheDocument()
  })

  // Given the modal is open
  // When the user clicks the close button
  // Then onClose should be called
  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })

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

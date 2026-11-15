import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { ClientDetailHeader } from './ClientDetailHeader'
import type { ClientDetail } from '../../types/client.types'

const mockClient: ClientDetail = {
  id: 'client-1',
  name: 'Laura García',
  email: null,
  phone: null,
  channels: ['GMAIL', 'WHATSAPP'],
  type: null,
  address: null,
  zone: null,
  latitude: null,
  longitude: null,
  lastContact: null,
  aiGenerated: false,
  clientTags: [],
  orders: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('ClientDetailHeader', () => {
  // Given a client
  // When ClientDetailHeader is rendered
  // Then the client's name should be shown
  it('shows the client name', () => {
    render(
      <MantineProvider>
        <ClientDetailHeader client={mockClient} onEdit={vi.fn()} onDelete={vi.fn()} />
      </MantineProvider>,
    )
    expect(screen.getByText('Laura García')).toBeInTheDocument()
  })

  // Given a client with an email and a phone
  // When ClientDetailHeader is rendered
  // Then both should be shown, each on its own line
  it('shows the client email and phone', () => {
    render(
      <MantineProvider>
        <ClientDetailHeader
          client={{ ...mockClient, email: 'laura@ejemplo.test', phone: '+34600000000' }}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </MantineProvider>,
    )
    expect(screen.getByText('laura@ejemplo.test')).toBeInTheDocument()
    expect(screen.getByText('+34600000000')).toBeInTheDocument()
  })

  // Given a client with no email or phone
  // When ClientDetailHeader is rendered
  // Then a dash should be shown instead
  it('shows a dash when there is no email or phone', () => {
    render(
      <MantineProvider>
        <ClientDetailHeader client={mockClient} onEdit={vi.fn()} onDelete={vi.fn()} />
      </MantineProvider>,
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  // Given a client with channels
  // When ClientDetailHeader is rendered
  // Then each channel's brand icon should be shown
  it('shows an icon for each of the client channels', () => {
    render(
      <MantineProvider>
        <ClientDetailHeader client={mockClient} onEdit={vi.fn()} onDelete={vi.fn()} />
      </MantineProvider>,
    )
    expect(screen.getByLabelText('Gmail')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
  })

  // Given a client the AI created
  // When ClientDetailHeader is rendered
  // Then it should say the record was suggested by the AI
  it('shows that the client was suggested by the AI', () => {
    render(
      <MantineProvider>
        <ClientDetailHeader
          client={{ ...mockClient, aiGenerated: true }}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </MantineProvider>,
    )

    expect(screen.getByText('Sugerido por IA')).toBeInTheDocument()
  })

  // Given a client a person created
  // When ClientDetailHeader is rendered
  // Then it should not claim the AI suggested it
  it('does not mark a client a person created', () => {
    render(
      <MantineProvider>
        <ClientDetailHeader client={mockClient} onEdit={vi.fn()} onDelete={vi.fn()} />
      </MantineProvider>,
    )

    expect(screen.queryByText('Sugerido por IA')).not.toBeInTheDocument()
  })

  // Given a client
  // When the user clicks the edit action
  // Then onEdit should be called
  it('calls onEdit when the edit action is clicked', () => {
    const onEdit = vi.fn()
    render(
      <MantineProvider>
        <ClientDetailHeader client={mockClient} onEdit={onEdit} onDelete={vi.fn()} />
      </MantineProvider>,
    )

    fireEvent.click(screen.getByLabelText('Editar cliente'))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  // Given a client
  // When the user clicks the delete action
  // Then onDelete should be called
  it('calls onDelete when the delete action is clicked', () => {
    const onDelete = vi.fn()
    render(
      <MantineProvider>
        <ClientDetailHeader client={mockClient} onEdit={vi.fn()} onDelete={onDelete} />
      </MantineProvider>,
    )

    fireEvent.click(screen.getByLabelText('Eliminar cliente'))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})

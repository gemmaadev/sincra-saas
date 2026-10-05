import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { ClientFormModal } from './ClientFormModal'
import type { ClientDetail } from '../types/client.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { post: vi.fn(), patch: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

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
  const onClose = vi.fn()
  render(
    withQueryClient(
      <MantineProvider>
        <ClientFormModal opened onClose={onClose} {...props} />
      </MantineProvider>,
    ),
  )
  return { onClose: props.onClose ?? onClose, user: userEvent.setup() }
}

describe('ClientFormModal', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
    vi.mocked(api.patch).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

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

  // Given the modal is opened to create a client
  // When it is rendered
  // Then every field should be shown empty and no channel selected
  it('shows empty fields in create mode', () => {
    renderModal()

    expect(screen.getByLabelText('Nombre')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Teléfono')).toHaveValue('')
    expect(screen.getByLabelText('Tipo de cliente')).toHaveValue('')
    expect(screen.getByLabelText('Zona')).toHaveValue('')
    expect(screen.getByLabelText('Dirección')).toHaveValue('')
    expect(screen.getByRole('checkbox', { name: 'Gmail' })).not.toBeChecked()
  })

  // Given an existing client with data
  // When the modal is opened to edit it
  // Then the fields should be prefilled and only its channels checked
  it('prefills the fields with the client data in edit mode', () => {
    renderModal({
      client: {
        ...mockClient,
        email: 'laura@ejemplo.test',
        phone: '+34600000000',
        channels: ['GMAIL', 'WHATSAPP'],
        type: 'empresa',
        zone: 'Barcelona',
        address: 'Carrer Major 1',
      },
    })

    expect(screen.getByLabelText('Nombre')).toHaveValue('Laura García')
    expect(screen.getByLabelText('Email')).toHaveValue('laura@ejemplo.test')
    expect(screen.getByLabelText('Teléfono')).toHaveValue('+34600000000')
    expect(screen.getByLabelText('Tipo de cliente')).toHaveValue('empresa')
    expect(screen.getByLabelText('Zona')).toHaveValue('Barcelona')
    expect(screen.getByLabelText('Dirección')).toHaveValue('Carrer Major 1')
    expect(screen.getByRole('checkbox', { name: 'Gmail' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'WhatsApp' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Outlook' })).not.toBeChecked()
  })

  // Given the modal is closed
  // When it is rendered
  // Then nothing should be shown
  it('renders nothing when it is not opened', () => {
    renderModal({ opened: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  // Given a valid new client
  // When the user submits the create form
  // Then the client should be created with empty optional fields as null and the modal closed
  it('creates the client and closes the modal', async () => {
    vi.mocked(api.post).mockResolvedValue({ client: mockClient })
    const { onClose, user } = renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Laura García')
    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(notifySuccess).toHaveBeenCalledWith('Cliente creado')
    expect(api.post).toHaveBeenCalledWith('/clients', {
      name: 'Laura García',
      email: null,
      phone: null,
      channels: ['GMAIL'],
      type: null,
      zone: null,
      address: null,
    })
  })

  // Given an existing client
  // When the user edits the name and saves
  // Then the client should be updated by id and the modal closed
  it('updates the client and closes the modal', async () => {
    vi.mocked(api.patch).mockResolvedValue({ client: mockClient })
    const { onClose, user } = renderModal({ client: mockClient })

    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), 'Laura Gómez')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(notifySuccess).toHaveBeenCalledWith('Cliente actualizado')
    expect(api.patch).toHaveBeenCalledWith(
      '/clients/client-1',
      expect.objectContaining({ name: 'Laura Gómez', channels: ['GMAIL'] }),
    )
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given the backend rejects the save with a message
  // When the user submits the form
  // Then that message should be shown and the modal should stay open
  it('shows the backend error and stays open when saving fails', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('Ya existe un cliente con ese email', 409, 'DUPLICATE_CLIENT'),
    )
    const { onClose, user } = renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Laura García')
    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    expect(await screen.findByText('Ya existe un cliente con ese email')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  // Given an unexpected failure that is not an API error
  // When the user submits the form
  // Then a generic error message should be shown
  it('shows a generic error when saving fails unexpectedly', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network down'))
    const { user } = renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Laura García')
    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    expect(
      await screen.findByText('No se ha podido guardar el cliente. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })

  // Given the form is invalid
  // When the user submits it
  // Then nothing should be sent to the API
  it('does not call the API when the form is invalid', async () => {
    const { user } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })
})

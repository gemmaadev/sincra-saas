import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientDetailPanel } from './ClientDetailPanel'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import type { ClientDetail } from '../types/client.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

const mockClient: ClientDetail = {
  id: 'client-1',
  name: 'Laura García',
  email: null,
  phone: null,
  channels: [],
  type: null,
  address: null,
  zone: null,
  latitude: null,
  longitude: null,
  lastContact: null,
  clientTags: [],
  orders: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function mockApiGet() {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.endsWith('/notes')) {
      return Promise.resolve({ notes: [] })
    }
    return Promise.resolve({ client: mockClient })
  })
}

function renderPanel(id = 'client-1', onDeleted = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <ClientDetailPanel id={id} onDeleted={onDeleted} />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('ClientDetailPanel', () => {
  beforeEach(() => {
    vi.mocked(notifySuccess).mockReset()
  })

  // Given a loaded client
  // When the user clicks the delete action
  // Then a confirmation modal should open naming the client, and cancelling should close it
  it('opens and closes the delete confirmation', async () => {
    mockApiGet()
    renderPanel()

    fireEvent.click(await screen.findByLabelText('Eliminar cliente'))

    const dialog = await screen.findByRole('dialog', { name: '¿Eliminar cliente?' })
    expect(dialog).toHaveTextContent('Laura García')

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: '¿Eliminar cliente?' })).not.toBeInTheDocument(),
    )
  })

  // Given the delete confirmation is open
  // When the user confirms
  // Then the client should be deleted, a notification shown and onDeleted called
  it('deletes the client when the user confirms', async () => {
    mockApiGet()
    vi.mocked(api.delete).mockResolvedValue(null)
    const onDeleted = vi.fn()
    renderPanel('client-1', onDeleted)

    fireEvent.click(await screen.findByLabelText('Eliminar cliente'))
    await screen.findByRole('dialog', { name: '¿Eliminar cliente?' })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1))
    expect(api.delete).toHaveBeenCalledWith('/clients/client-1')
    expect(notifySuccess).toHaveBeenCalledWith('Cliente eliminado')
  })

  // Given the backend rejects the deletion
  // When the user confirms
  // Then the error should be shown in the modal and the user should not be redirected
  it('shows the error and stays when the deletion fails', async () => {
    mockApiGet()
    vi.mocked(api.delete).mockRejectedValue(
      new ApiError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND'),
    )
    const onDeleted = vi.fn()
    renderPanel('client-1', onDeleted)

    fireEvent.click(await screen.findByLabelText('Eliminar cliente'))
    await screen.findByRole('dialog', { name: '¿Eliminar cliente?' })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('Cliente no encontrado')).toBeInTheDocument()
    expect(onDeleted).not.toHaveBeenCalled()
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  // Given a loaded client
  // When the user clicks the edit action
  // Then the form modal should open in edit mode with the client's data
  it('opens the edit modal prefilled with the client data', async () => {
    mockApiGet()
    renderPanel()

    fireEvent.click(await screen.findByLabelText('Editar cliente'))

    expect(await screen.findByRole('dialog', { name: 'Editar cliente' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Laura García')
  })

  // Given the client request has not resolved yet
  // When ClientDetailPanel is rendered
  // Then a loading message should be shown
  it('shows a loading message while the client is being fetched', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}))
    renderPanel()
    expect(screen.getByText('Cargando cliente...')).toBeInTheDocument()
  })

  // Given the client request fails
  // When ClientDetailPanel is rendered
  // Then an error message should be shown
  it('shows an error message when the request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))
    renderPanel()
    expect(await screen.findByText('No se ha podido cargar el cliente.')).toBeInTheDocument()
  })

  // Given a successful response
  // When ClientDetailPanel is rendered
  // Then the header and the Resumen tab content should both be visible
  it('renders the header and the Resumen tab by default', async () => {
    mockApiGet()
    renderPanel()
    expect(await screen.findByText('Laura García')).toBeInTheDocument()
    expect(screen.getByText('Cliente desde')).toBeInTheDocument()
  })

  // Given the Historial tab is out of scope for this project
  // When ClientDetailPanel is rendered
  // Then that tab should be disabled, not just show a message when clicked
  it('disables the Historial tab instead of making it clickable', async () => {
    mockApiGet()
    renderPanel()
    await screen.findByText('Laura García')
    expect(screen.getByRole('tab', { name: 'Historial' })).toBeDisabled()
  })

  // Given the clients tabs
  // When the user selects Notas
  // Then the real NotesTab content (its "add note" form) should be shown
  it('switches to the Notas tab content when selected', async () => {
    mockApiGet()
    renderPanel()
    await screen.findByText('Laura García')
    fireEvent.click(screen.getByRole('tab', { name: 'Notas' }))
    expect(
      await screen.findByPlaceholderText('Escribe una nota sobre este cliente...'),
    ).toBeInTheDocument()
  })
})

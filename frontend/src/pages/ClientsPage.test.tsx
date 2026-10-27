import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ClientsPage from './ClientsPage'
import { api } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import type { Client, ClientDetail } from '@/features/clients/types/client.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

// Reused both as a list row (Client) and as the /clients/:id detail response
// (ClientDetail) in the mocks below, so it carries every field either needs.
const mockClient: Client & ClientDetail = {
  id: 'client-1',
  name: 'Laura García',
  email: 'laura@ejemplo.test',
  phone: null,
  channels: ['GMAIL'],
  type: null,
  zone: null,
  address: null,
  latitude: null,
  longitude: null,
  lastContact: null,
  clientTags: [],
  orders: [],
  orderCount: 0,
  lastOrderAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function mockApiGet(overrides?: {
  data?: (typeof mockClient)[]
  total?: number
  newClientsCount?: number
  recurringClientsCount?: number
  potentialClientsCount?: number
}) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.startsWith('/tags')) {
      return Promise.resolve({ tags: [] })
    }
    if (path.startsWith('/clients/')) {
      return Promise.resolve({ client: mockClient })
    }
    const data = overrides?.data ?? [mockClient]
    return Promise.resolve({
      data,
      pagination: { page: 1, limit: 10, total: overrides?.total ?? data.length, totalPages: 1 },
      newClientsCount: overrides?.newClientsCount ?? 0,
      recurringClientsCount: overrides?.recurringClientsCount ?? 0,
      potentialClientsCount: overrides?.potentialClientsCount ?? 0,
    })
  })
}

const secondPageClient = {
  ...mockClient,
  id: 'client-2',
  name: 'Carlos Ruiz',
  email: 'carlos@ejemplo.test',
}

function mockTwoPagesOfClients() {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.startsWith('/tags')) {
      return Promise.resolve({ tags: [] })
    }
    const isSecondPage = path.includes('page=2')
    return Promise.resolve({
      data: [isSecondPage ? secondPageClient : mockClient],
      pagination: { page: isSecondPage ? 2 : 1, limit: 1, total: 2, totalPages: 2 },
      newClientsCount: 0,
    })
  })
}

function renderClientsPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/clients']}>
          <ClientsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('ClientsPage', () => {
  beforeEach(() => {
    mockApiGet()
    vi.mocked(api.delete).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given clients returned by the API
  // When ClientsPage is rendered
  // Then each client's name should appear in the table
  it('renders the clients returned by the API', async () => {
    renderClientsPage()
    expect(await screen.findByText('Laura García')).toBeInTheDocument()
  })

  // Given the clients page header
  // When ClientsPage is rendered
  // Then a "Nuevo cliente" button should be available to create a client
  it('shows the "Nuevo cliente" button', async () => {
    renderClientsPage()
    expect(await screen.findByRole('button', { name: 'Nuevo cliente' })).toBeInTheDocument()
  })

  // Given the clients page
  // When the user clicks "Nuevo cliente"
  // Then the create client modal should open
  it('opens the create modal when "Nuevo cliente" is clicked', async () => {
    renderClientsPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Nuevo cliente' }))

    expect(await screen.findByRole('dialog', { name: 'Nuevo cliente' })).toBeInTheDocument()
  })

  // Given the clients table is rendered
  // When the user ticks a client checkbox
  // Then the client should be selected and its detail should not open
  it('selects a client without opening its detail', async () => {
    renderClientsPage()
    const checkbox = await screen.findByRole('checkbox', { name: 'Seleccionar Laura García' })

    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.getAllByText('Laura García')).toHaveLength(1)
  })

  // Given the clients table is rendered
  // When the user ticks "Seleccionar todos" and then ticks it again
  // Then every client should be selected and then deselected
  it('selects and deselects every client with the header checkbox', async () => {
    renderClientsPage()
    const selectAll = await screen.findByRole('checkbox', { name: 'Seleccionar todos' })
    const clientCheckbox = screen.getByRole('checkbox', { name: 'Seleccionar Laura García' })

    fireEvent.click(selectAll)
    expect(clientCheckbox).toBeChecked()

    fireEvent.click(selectAll)
    expect(clientCheckbox).not.toBeChecked()
  })

  // Given no client is selected
  // When the page is rendered
  // Then the bulk delete button should not be shown
  it('hides the bulk delete button when nothing is selected', async () => {
    renderClientsPage()
    await screen.findByText('Laura García')

    expect(screen.queryByRole('button', { name: /Eliminar \(/ })).not.toBeInTheDocument()
  })

  // Given a client is selected on page 1
  // When the user goes to page 2 and selects another client
  // Then the selection count should add up across pages
  it('keeps the selection when changing page', async () => {
    mockTwoPagesOfClients()
    renderClientsPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar Laura García' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 cliente seleccionado')

    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar Carlos Ruiz' }))

    expect(screen.getByRole('status')).toHaveTextContent('2 clientes seleccionados')
    expect(screen.getByRole('button', { name: 'Eliminar (2)' })).toBeInTheDocument()
  })

  // Given a client is selected
  // When the user changes a filter
  // Then the selection should be cleared, since it is another list
  it('clears the selection when a filter changes', async () => {
    renderClientsPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar Laura García' }))
    expect(screen.getByRole('status')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'laura' } })

    expect(screen.queryByRole('region', { name: 'Acciones de selección' })).not.toBeInTheDocument()
  })

  // Given a client is selected
  // When the user clears the selection from the selection bar
  // Then the client should be deselected and the bar should disappear
  it('clears the selection from the selection bar', async () => {
    renderClientsPage()
    const checkbox = await screen.findByRole('checkbox', { name: 'Seleccionar Laura García' })
    fireEvent.click(checkbox)
    expect(screen.getByRole('status')).toHaveTextContent('1 cliente seleccionado')

    fireEvent.click(screen.getByRole('button', { name: 'Deseleccionar' }))

    expect(checkbox).not.toBeChecked()
    expect(screen.queryByRole('region', { name: 'Acciones de selección' })).not.toBeInTheDocument()
  })

  // Given a client is selected
  // When the user clicks the bulk delete button
  // Then a confirmation with the number of clients should open
  it('shows the bulk delete button with the count and opens the confirmation', async () => {
    renderClientsPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar Laura García' }))

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))

    expect(await screen.findByRole('dialog', { name: '¿Eliminar 1 cliente?' })).toBeInTheDocument()
    expect(api.delete).not.toHaveBeenCalled()
  })

  // Given the bulk delete confirmation is open
  // When the user confirms
  // Then the selected clients should be deleted and the selection cleared
  it('deletes the selected clients and clears the selection', async () => {
    vi.mocked(api.delete).mockResolvedValue(null)
    renderClientsPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar Laura García' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await screen.findByRole('dialog', { name: '¿Eliminar 1 cliente?' })

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/clients/client-1'))
    await waitFor(() => expect(notifySuccess).toHaveBeenCalledWith('Cliente eliminado'))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Eliminar \(/ })).not.toBeInTheDocument(),
    )
  })

  // Given several clients on the page
  // When the user selects them all and confirms the bulk deletion
  // Then every selected client should be deleted and the selection cleared
  it('deletes several selected clients at once', async () => {
    mockApiGet({ data: [mockClient, secondPageClient] })
    vi.mocked(api.delete).mockResolvedValue(null)
    renderClientsPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar todos' }))

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar (2)' }))
    await screen.findByRole('dialog', { name: '¿Eliminar 2 clientes?' })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledTimes(2))
    expect(api.delete).toHaveBeenCalledWith('/clients/client-1')
    expect(api.delete).toHaveBeenCalledWith('/clients/client-2')
    await waitFor(() => expect(notifySuccess).toHaveBeenCalledWith('2 clientes eliminados'))
    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Acciones de selección' }),
      ).not.toBeInTheDocument(),
    )
  })

  // Given the clients table is rendered
  // When the user clicks a row
  // Then the client detail drawer should open showing that client's data
  it('opens the detail drawer with the client data when a row is clicked', async () => {
    renderClientsPage()
    const row = await screen.findByText('Laura García')
    fireEvent.click(row.closest('tr')!)
    await waitFor(() => expect(screen.getAllByText('Laura García')).toHaveLength(2))
    expect(screen.getByLabelText('Cerrar')).toBeInTheDocument()
  })

  // Given a successful response with a known total
  // When ClientsPage is rendered
  // Then the "Total de clientes" KPI should show that total
  it('shows the real total in the "Total de clientes" KPI', async () => {
    mockApiGet({ data: [mockClient], total: 25 })
    renderClientsPage()
    await waitFor(() => expect(screen.getByText('25')).toBeInTheDocument())
  })

  // Given a successful response with a known newClientsCount
  // When ClientsPage is rendered
  // Then the "Clientes nuevos" KPI should show that count
  it('shows the real count in the "Clientes nuevos" KPI', async () => {
    mockApiGet({ data: [mockClient], newClientsCount: 7 })
    renderClientsPage()
    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument())
  })

  // Given a successful response with known recurring and potential client counts
  // When ClientsPage is rendered
  // Then the "Clientes recurrentes" and "Clientes potenciales" KPIs should show those counts
  it('shows the real counts in the "Clientes recurrentes" and "Clientes potenciales" KPIs', async () => {
    mockApiGet({ data: [mockClient], recurringClientsCount: 17, potentialClientsCount: 4 })
    renderClientsPage()
    await waitFor(() => expect(screen.getByText('17')).toBeInTheDocument())
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  // Given a client with orders
  // When ClientsPage is rendered
  // Then the table should show the client's order count and the date of their last order
  it('shows the order count and last order date in the table', async () => {
    mockApiGet({
      data: [{ ...mockClient, orderCount: 5, lastOrderAt: '2026-10-07T10:16:33.000Z' }],
    })
    renderClientsPage()
    await screen.findByText('Laura García')
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('5')
    expect(table).toHaveTextContent('07 oct 2026')
  })

  // Given a client with no orders at all
  // When ClientsPage is rendered
  // Then the "Última compra" cell should show a placeholder, not a date
  it('shows a placeholder for last activity when the client has no orders', async () => {
    mockApiGet({ data: [{ ...mockClient, orderCount: 0, lastOrderAt: null }] })
    renderClientsPage()
    await screen.findByText('Laura García')
    expect(screen.getByTitle('Este cliente todavía no tiene pedidos')).toBeInTheDocument()
  })

  // Given no clients returned by the API
  // When ClientsPage is rendered
  // Then the empty state should be shown instead of the table
  it('shows the empty state when there are no clients', async () => {
    mockApiGet({ data: [] })
    renderClientsPage()
    expect(await screen.findByText('Todavía no tienes clientes')).toBeInTheDocument()
  })

  // Given there are no results while a filter is active
  // When ClientsPage is rendered
  // Then it should show the "no results" empty state instead of "no clients yet",
  // and clearing filters should bring back the "no clients yet" wording
  it('shows a different empty state when filters are active, with a way to clear them', async () => {
    mockApiGet({ data: [] })
    renderClientsPage()
    await screen.findByText('Todavía no tienes clientes')

    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'laura' } })

    expect(await screen.findByText('No se han encontrado clientes')).toBeInTheDocument()
    expect(screen.queryByText('Todavía no tienes clientes')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(await screen.findByText('Todavía no tienes clientes')).toBeInTheDocument()
  })

  // Given the API call fails
  // When ClientsPage is rendered
  // Then an error message should be shown
  it('shows an error message when the clients request fails', async () => {
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path.startsWith('/tags')) {
        return Promise.resolve({ tags: [] })
      }
      return Promise.reject(new Error('Network error'))
    })
    renderClientsPage()
    expect(await screen.findByText('No se han podido cargar los clientes.')).toBeInTheDocument()
  })
})

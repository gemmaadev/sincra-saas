import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientsPage } from './ClientsPage'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockClient = {
  id: 'client-1',
  name: 'Laura García',
  email: 'laura@ejemplo.test',
  phone: null,
  channels: ['GMAIL'],
  type: null,
  zone: null,
  clientTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function mockApiGet(overrides?: {
  data?: typeof mockClient[]
  total?: number
  newClientsCount?: number
}) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.startsWith('/tags')) {
      return Promise.resolve({ tags: [] })
    }
    const data = overrides?.data ?? [mockClient]
    return Promise.resolve({
      data,
      pagination: { page: 1, limit: 10, total: overrides?.total ?? data.length, totalPages: 1 },
      newClientsCount: overrides?.newClientsCount ?? 0,
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
  })

  // Given clients returned by the API
  // When ClientsPage is rendered
  // Then each client's name should appear in the table
  it('renders the clients returned by the API', async () => {
    renderClientsPage()
    expect(await screen.findByText('Laura García')).toBeInTheDocument()
  })

  // Given the clients table is rendered
  // When the user clicks a row
  // Then the client detail drawer should open showing that client's id
  it('opens the detail drawer with the client id when a row is clicked', async () => {
    renderClientsPage()
    const row = await screen.findByText('Laura García')
    row.closest('tr')!.click()
    expect(await screen.findByText('Ficha de cliente')).toBeInTheDocument()
    expect(screen.getByText(/client-1/)).toBeInTheDocument()
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

  // Given no clients returned by the API
  // When ClientsPage is rendered
  // Then the empty state should be shown instead of the table
  it('shows the empty state when there are no clients', async () => {
    mockApiGet({ data: [] })
    renderClientsPage()
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

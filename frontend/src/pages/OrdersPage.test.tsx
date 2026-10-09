import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import OrdersPage from './OrdersPage'
import { api } from '@/shared/services'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

const mockOrder = {
  id: 'order-1',
  number: 1,
  status: 'PENDING',
  channel: 'GMAIL',
  kind: 'PRODUCT',
  price: '89.90',
  expectedDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  client: { id: 'client-1', name: 'Laura García' },
  description: 'Chaqueta oversize',
}

function mockApiGet(overrides?: {
  data?: (typeof mockOrder)[]
  total?: number
  statusCounts?: Record<string, number>
}) {
  vi.mocked(api.get).mockImplementation(() => {
    const data = overrides?.data ?? [mockOrder]
    return Promise.resolve({
      data,
      pagination: { page: 1, limit: 10, total: overrides?.total ?? data.length, totalPages: 1 },
      statusCounts: overrides?.statusCounts ?? {
        PENDING: 1,
        PREPARING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      },
    })
  })
}

function renderOrdersPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/orders']}>
          <OrdersPage />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('OrdersPage', () => {
  beforeEach(() => {
    mockApiGet()
  })

  // Given orders returned by the API
  // When OrdersPage is rendered
  // Then the client, product and status should appear in the table
  it('renders the orders returned by the API', async () => {
    renderOrdersPage()
    await screen.findByText('Laura García')
    const table = within(screen.getByRole('table'))
    expect(table.getByText('Chaqueta oversize')).toBeInTheDocument()
    expect(table.getByText('Pendiente')).toBeInTheDocument()
  })

  // Given the orders page header
  // When OrdersPage is rendered
  // Then the "Nuevo pedido" button should be shown, disabled until the create modal exists
  it('shows a disabled "Nuevo pedido" button', async () => {
    renderOrdersPage()
    expect(await screen.findByRole('button', { name: 'Nuevo pedido' })).toBeDisabled()
  })

  // Given a successful response with a known total
  // When OrdersPage is rendered
  // Then the "Total de pedidos" KPI should show that total
  it('shows the real total in the "Total de pedidos" KPI', async () => {
    mockApiGet({ total: 60 })
    renderOrdersPage()
    await waitFor(() => expect(screen.getByText('60')).toBeInTheDocument())
  })

  // Given a successful response with known status counts
  // When OrdersPage is rendered
  // Then each status KPI should show its own count, not the pending placeholder
  it('shows the real counts in the status KPIs', async () => {
    mockApiGet({
      statusCounts: { PENDING: 5, PREPARING: 28, SHIPPED: 47, DELIVERED: 51, CANCELLED: 2 },
    })
    renderOrdersPage()
    await waitFor(() => expect(screen.getByText('28')).toBeInTheDocument())
    expect(screen.getByText('47')).toBeInTheDocument()
    expect(screen.getByText('51')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  // Given no orders returned by the API
  // When OrdersPage is rendered
  // Then the empty state should be shown instead of the table
  it('shows the empty state when there are no orders', async () => {
    mockApiGet({ data: [] })
    renderOrdersPage()
    expect(await screen.findByText('Todavía no tienes pedidos')).toBeInTheDocument()
  })

  // Given the API call fails
  // When OrdersPage is rendered
  // Then an error message should be shown
  it('shows an error message when the orders request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))
    renderOrdersPage()
    expect(await screen.findByText('No se han podido cargar los pedidos.')).toBeInTheDocument()
  })

  // Given the orders table is rendered
  // When the user picks a status filter
  // Then the request should include that status
  it('refetches with the chosen status filter', async () => {
    renderOrdersPage()
    await screen.findByText('Laura García')

    await userEvent.setup().selectOptions(screen.getByLabelText('Estado'), 'PREPARING')

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('status=PREPARING')),
    )
  })
})

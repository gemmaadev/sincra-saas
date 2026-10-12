import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import OrdersPage from './OrdersPage'
import { api } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

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

const mockOrderDetail = {
  ...mockOrder,
  address: null,
  zone: null,
  notes: null,
  client: { ...mockOrder.client, email: null, phone: null, channels: [] },
  items: [],
  statusHistory: [],
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const secondOrder = {
  ...mockOrder,
  id: 'order-2',
  number: 2,
  client: { id: 'client-2', name: 'Carlos Ruiz' },
}

function mockApiGet(overrides?: {
  data?: (typeof mockOrder)[]
  total?: number
  statusCounts?: Record<string, number>
}) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.startsWith('/orders/')) {
      return Promise.resolve({ order: mockOrderDetail })
    }

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

  // Given the orders page
  // When the user clicks "Nuevo pedido"
  // Then the create order modal should open
  it('opens the create modal when "Nuevo pedido" is clicked', async () => {
    renderOrdersPage()

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Nuevo pedido' }))

    expect(await screen.findByRole('dialog', { name: 'Nuevo pedido' })).toBeInTheDocument()
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
  // When the user clicks an order row
  // Then the detail drawer should open with that order's data
  it('opens the detail drawer when a row is clicked', async () => {
    renderOrdersPage()
    await userEvent.setup().click(await screen.findByText('Laura García'))

    expect(await screen.findByText('Pedido #1')).toBeInTheDocument()
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

  // Given the orders table is rendered
  // When the user ticks an order checkbox
  // Then the order should be selected without opening its detail
  it('selects an order without opening its detail', async () => {
    renderOrdersPage()
    const checkbox = await screen.findByRole('checkbox', { name: 'Seleccionar pedido #1' })

    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.queryByText('Pedido #1')).not.toBeInTheDocument()
  })

  // Given the orders table is rendered
  // When the user ticks "Seleccionar todos" and then ticks it again
  // Then every order should be selected and then deselected
  it('selects and deselects every order with the header checkbox', async () => {
    mockApiGet({ data: [mockOrder, secondOrder], total: 2 })
    renderOrdersPage()
    const selectAll = await screen.findByRole('checkbox', { name: 'Seleccionar todos' })
    const orderCheckbox = screen.getByRole('checkbox', { name: 'Seleccionar pedido #1' })

    fireEvent.click(selectAll)
    expect(orderCheckbox).toBeChecked()

    fireEvent.click(selectAll)
    expect(orderCheckbox).not.toBeChecked()
  })

  // Given no order is selected
  // When the page is rendered
  // Then neither bulk action button should be shown
  it('hides the bulk action buttons when nothing is selected', async () => {
    renderOrdersPage()
    await screen.findByText('Laura García')

    expect(screen.queryByRole('button', { name: /Eliminar \(/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancelar \(/ })).not.toBeInTheDocument()
  })

  // Given an order is selected
  // When the user changes a filter
  // Then the selection should be cleared, since it is another list
  it('clears the selection when a filter changes', async () => {
    renderOrdersPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar pedido #1' }))
    expect(screen.getByRole('status')).toBeInTheDocument()

    await userEvent.setup().selectOptions(screen.getByLabelText('Estado'), 'PREPARING')

    expect(screen.queryByRole('region', { name: 'Acciones de selección' })).not.toBeInTheDocument()
  })

  // Given an order is selected
  // When the user clears the selection from the selection bar
  // Then the order should be deselected and the bar should disappear
  it('clears the selection from the selection bar', async () => {
    renderOrdersPage()
    const checkbox = await screen.findByRole('checkbox', { name: 'Seleccionar pedido #1' })
    fireEvent.click(checkbox)
    expect(screen.getByRole('status')).toHaveTextContent('1 pedido seleccionado')

    fireEvent.click(screen.getByRole('button', { name: 'Deseleccionar' }))

    expect(checkbox).not.toBeChecked()
    expect(screen.queryByRole('region', { name: 'Acciones de selección' })).not.toBeInTheDocument()
  })

  // Given an order is selected
  // When the user clicks the bulk delete button
  // Then a confirmation with the number of orders should open
  it('shows the bulk delete button with the count and opens the confirmation', async () => {
    renderOrdersPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar pedido #1' }))

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))

    expect(await screen.findByRole('dialog', { name: '¿Eliminar 1 pedido?' })).toBeInTheDocument()
    expect(api.delete).not.toHaveBeenCalled()
  })

  // Given the bulk delete confirmation is open
  // When the user confirms
  // Then the selected order should be deleted and the selection cleared
  it('deletes the selected order and clears the selection', async () => {
    vi.mocked(api.delete).mockResolvedValue(null)
    renderOrdersPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar pedido #1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await screen.findByRole('dialog', { name: '¿Eliminar 1 pedido?' })

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/orders/order-1'))
    await waitFor(() => expect(notifySuccess).toHaveBeenCalledWith('Pedido eliminado'))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Eliminar \(/ })).not.toBeInTheDocument(),
    )
  })

  // Given an order is selected
  // When the user clicks the bulk cancel button
  // Then a confirmation with the number of orders should open
  it('shows the bulk cancel button with the count and opens the confirmation', async () => {
    renderOrdersPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar pedido #1' }))

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar (1)' }))

    expect(await screen.findByRole('dialog', { name: '¿Cancelar 1 pedido?' })).toBeInTheDocument()
    expect(api.patch).not.toHaveBeenCalled()
  })

  // Given the bulk cancel confirmation is open
  // When the user confirms
  // Then the selected order should be cancelled and the selection cleared
  it('cancels the selected order and clears the selection', async () => {
    vi.mocked(api.patch).mockResolvedValue({ order: mockOrderDetail })
    renderOrdersPage()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar pedido #1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar (1)' }))
    await screen.findByRole('dialog', { name: '¿Cancelar 1 pedido?' })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedidos' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/orders/order-1', { status: 'CANCELLED' }),
    )
    await waitFor(() => expect(notifySuccess).toHaveBeenCalledWith('Pedido cancelado'))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Cancelar \(/ })).not.toBeInTheDocument(),
    )
  })
})

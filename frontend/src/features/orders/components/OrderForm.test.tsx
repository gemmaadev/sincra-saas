import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { OrderForm } from './OrderForm'
import type { OrderDetail } from '../types/order.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn() } }
})

const mockOrder: OrderDetail = {
  id: 'order-1',
  number: 7,
  status: 'PENDING',
  channel: 'WHATSAPP',
  kind: 'PRODUCT',
  price: '30.00',
  address: 'Carrer Major 1',
  zone: 'Sabadell',
  expectedDate: '2026-11-01T00:00:00.000Z',
  description: null,
  client: { id: 'client-1', name: 'Laura García', email: null, phone: null, channels: [] },
  items: [{ id: 'item-1', product: 'Camiseta', description: null, quantity: 2, unitPrice: '15.00' }],
  statusHistory: [],
  orderTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderForm(props: Partial<React.ComponentProps<typeof OrderForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(
    withQueryClient(
      <MantineProvider>
        <OrderForm onSubmit={onSubmit} onCancel={onCancel} {...props} />
      </MantineProvider>,
    ),
  )
  return { onSubmit, onCancel, user: userEvent.setup() }
}

async function selectClient(user: ReturnType<typeof userEvent.setup>) {
  vi.mocked(api.get).mockResolvedValue({
    data: [{ id: 'client-1', name: 'Laura García', email: null, phone: null }],
  })
  await user.type(screen.getByLabelText('Buscar cliente'), 'Laura')
  await user.click(await screen.findByRole('button', { name: /Laura García/ }))
}

describe('OrderForm', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given an empty create form
  // When the user submits it without picking a client
  // Then the client error should be shown and nothing should be submitted
  it('requires a client', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    expect(await screen.findByText('Indica el cliente')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given the client search
  // When the user picks a client
  // Then the search is replaced with the selected client, and "Cambiar" brings the search back
  it('selects a client and allows changing it', async () => {
    const { user } = renderForm()

    await selectClient(user)

    expect(screen.getByText('Laura García')).toBeInTheDocument()
    expect(screen.queryByLabelText('Buscar cliente')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cambiar' }))
    expect(screen.getByLabelText('Buscar cliente')).toBeInTheDocument()
  })

  // Given a client picked but no product filled in
  // When the user submits the form
  // Then the product error should be shown and nothing should be submitted
  it('requires a product', async () => {
    const { onSubmit, user } = renderForm()

    await selectClient(user)
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    expect(await screen.findByText('Obligatorio')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given a product with a price of 0
  // When the user submits the form
  // Then the price error should be shown and nothing should be submitted
  it('rejects a price that is not greater than 0', async () => {
    const { onSubmit, user } = renderForm()

    await selectClient(user)
    await user.type(screen.getByLabelText('Producto'), 'Camiseta')
    await user.clear(screen.getByLabelText('Precio'))
    await user.type(screen.getByLabelText('Precio'), '0')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    expect(await screen.findByText('Debe ser > 0')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given one product line
  // When the user clicks "Añadir producto"
  // Then a second product line should appear, with a remove button on each
  it('adds and removes product lines', async () => {
    const { user } = renderForm()

    expect(screen.getAllByLabelText('Producto')).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /Quitar producto/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Añadir producto' }))
    expect(screen.getAllByLabelText('Producto')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Quitar producto 2' }))
    expect(screen.getAllByLabelText('Producto')).toHaveLength(1)
  })

  // Given a valid client and product
  // When the user submits the form
  // Then onSubmit should receive the form values
  it('submits the form values', async () => {
    const { onSubmit, user } = renderForm()

    await selectClient(user)
    await user.type(screen.getByLabelText('Producto'), 'Camiseta')
    await user.clear(screen.getByLabelText('Precio'))
    await user.type(screen.getByLabelText('Precio'), '15')
    await user.type(screen.getByLabelText('Zona'), 'Barcelona')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      clientId: 'client-1',
      items: [{ product: 'Camiseta', description: '', quantity: 1, unitPrice: 15 }],
      zone: 'Barcelona',
    })
  })

  // Given an existing order
  // When the form is rendered
  // Then it should be prefilled and the submit button should say "Guardar cambios"
  it('prefills the form when editing an order', () => {
    renderForm({ order: mockOrder })

    expect(screen.getByText('Laura García')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Camiseta')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  // Given the parent passed a submit error
  // When the form is rendered
  // Then the error should be shown
  it('shows the submit error', () => {
    renderForm({ submitError: 'No se ha podido guardar el pedido.' })

    expect(screen.getByText('No se ha podido guardar el pedido.')).toBeInTheDocument()
  })
})

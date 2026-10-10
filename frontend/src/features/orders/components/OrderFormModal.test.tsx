import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { OrderFormModal } from './OrderFormModal'
import type { OrderDetail } from '../types/order.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

const mockOrder: OrderDetail = {
  id: 'order-1',
  number: 7,
  status: 'PENDING',
  channel: 'WHATSAPP',
  kind: 'PRODUCT',
  price: '30.00',
  address: 'Carrer Major 1',
  zone: 'Sabadell',
  expectedDate: null,
  description: null,
  client: { id: 'client-1', name: 'Laura García', email: null, phone: null, channels: [] },
  items: [{ id: 'item-1', product: 'Camiseta', description: null, quantity: 2, unitPrice: '15.00' }],
  statusHistory: [],
  orderTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderModal(props: Partial<React.ComponentProps<typeof OrderFormModal>> = {}) {
  const onClose = vi.fn()
  render(
    withQueryClient(
      <MantineProvider>
        <OrderFormModal opened onClose={onClose} {...props} />
      </MantineProvider>,
    ),
  )
  return { onClose: props.onClose ?? onClose, user: userEvent.setup() }
}

async function selectClient(user: ReturnType<typeof userEvent.setup>) {
  vi.mocked(api.get).mockResolvedValue({
    data: [{ id: 'client-1', name: 'Laura García', email: null, phone: null }],
  })
  await user.type(screen.getByLabelText('Buscar cliente'), 'Laura')
  await user.click(await screen.findByRole('button', { name: /Laura García/ }))
}

describe('OrderFormModal', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
    vi.mocked(api.patch).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given no order is passed
  // When the modal is opened
  // Then it should be in create mode, titled "Nuevo pedido"
  it('shows the create title when there is no order', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Nuevo pedido' })).toBeInTheDocument()
  })

  // Given an existing order is passed
  // When the modal is opened
  // Then it should be in edit mode, titled "Editar pedido"
  it('shows the edit title when an order is passed', () => {
    renderModal({ order: mockOrder })
    expect(screen.getByRole('dialog', { name: 'Editar pedido' })).toBeInTheDocument()
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

  // Given an existing order with data
  // When the modal is opened to edit it
  // Then the client and the product should be prefilled
  it('prefills the fields with the order data in edit mode', () => {
    renderModal({ order: mockOrder })

    expect(screen.getByText('Laura García')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Camiseta')).toBeInTheDocument()
    expect(screen.getByLabelText('Zona')).toHaveValue('Sabadell')
  })

  // Given a valid new order
  // When the user picks a client, fills a product and submits
  // Then the order should be created and the modal closed
  it('creates the order and closes the modal', async () => {
    vi.mocked(api.post).mockResolvedValue({ order: mockOrder })
    const { onClose, user } = renderModal()

    await selectClient(user)
    await user.type(screen.getByLabelText('Producto'), 'Camiseta')
    await user.clear(screen.getByLabelText('Precio'))
    await user.type(screen.getByLabelText('Precio'), '15')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(notifySuccess).toHaveBeenCalledWith('Pedido creado')
    expect(api.post).toHaveBeenCalledWith(
      '/orders',
      expect.objectContaining({
        clientId: 'client-1',
        items: [{ product: 'Camiseta', description: null, quantity: 1, unitPrice: 15 }],
      }),
    )
  })

  // Given an existing order
  // When the user edits the zone and saves
  // Then the order should be updated by id and the modal closed
  it('updates the order and closes the modal', async () => {
    vi.mocked(api.patch).mockResolvedValue({ order: mockOrder })
    const { onClose, user } = renderModal({ order: mockOrder })

    await user.clear(screen.getByLabelText('Zona'))
    await user.type(screen.getByLabelText('Zona'), 'Terrassa')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(notifySuccess).toHaveBeenCalledWith('Pedido actualizado')
    expect(api.patch).toHaveBeenCalledWith(
      '/orders/order-1',
      expect.objectContaining({ zone: 'Terrassa' }),
    )
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given the backend rejects the save with a message
  // When the user submits the form
  // Then that message should be shown and the modal should stay open
  it('shows the backend error and stays open when saving fails', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('No se ha podido asignar el número de pedido', 409, 'ORDER_NUMBER_CONFLICT'),
    )
    const { onClose, user } = renderModal()

    await selectClient(user)
    await user.type(screen.getByLabelText('Producto'), 'Camiseta')
    await user.clear(screen.getByLabelText('Precio'))
    await user.type(screen.getByLabelText('Precio'), '15')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    expect(await screen.findByText('No se ha podido asignar el número de pedido')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  // Given an unexpected failure that is not an API error
  // When the user submits the form
  // Then a generic error message should be shown
  it('shows a generic error when saving fails unexpectedly', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network down'))
    const { user } = renderModal()

    await selectClient(user)
    await user.type(screen.getByLabelText('Producto'), 'Camiseta')
    await user.clear(screen.getByLabelText('Precio'))
    await user.type(screen.getByLabelText('Precio'), '15')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    expect(
      await screen.findByText('No se ha podido guardar el pedido. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })

  // Given the form is invalid (no client picked)
  // When the user submits it
  // Then nothing should be sent to the API
  it('does not call the API when the form is invalid', async () => {
    const { user } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    expect(await screen.findByText('Indica el cliente')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })
})

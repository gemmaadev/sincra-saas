import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderTimeline } from './OrderTimeline'
import { api } from '@/shared/services'
import type { OrderDetail } from '../../types/order.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

const mockOrder: OrderDetail = {
  id: 'order-1',
  number: 7,
  status: 'PREPARING',
  channel: 'WHATSAPP',
  kind: 'PRODUCT',
  price: '50.00',
  address: null,
  zone: null,
  expectedDate: null,
  description: null,
  client: { id: 'client-1', name: 'Laura García', email: null, phone: null, channels: [] },
  items: [],
  statusHistory: [
    { id: 'change-1', status: 'PENDING', changedBy: null, changedAt: '2025-04-12T10:24:00.000Z' },
    { id: 'change-2', status: 'PREPARING', changedBy: null, changedAt: '2025-04-12T14:32:00.000Z' },
  ],
  aiGenerated: false,
  orderTags: [],
  createdAt: '2025-04-12T10:24:00.000Z',
  updatedAt: '2025-04-12T14:32:00.000Z',
}

function renderTimeline(order: OrderDetail = mockOrder) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <OrderTimeline order={order} />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('OrderTimeline', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue(null)
  })

  // Given an order that has reached PENDING and PREPARING
  // When the timeline is rendered
  // Then both steps should show their actual change date
  it('shows the change date for steps the order has reached', () => {
    renderTimeline()

    expect(screen.getByText('Pedido recibido')).toBeInTheDocument()
    expect(screen.getByText('En preparación')).toBeInTheDocument()
    expect(screen.getAllByText(/12 abr 2025/).length).toBe(2)
  })

  // Given an order that has not reached Enviado or Entregado yet
  // When the timeline is rendered
  // Then those steps should show a fallback dash instead of a date
  it('shows a fallback dash for steps not reached yet', () => {
    renderTimeline()

    expect(screen.getByText('Enviado').nextSibling).toHaveTextContent('—')
    expect(screen.getByText('Entregado').nextSibling).toHaveTextContent('—')
  })

  // Given an order that is DELIVERED
  // When the timeline is rendered
  // Then there should be no cancelled notice, nor an "Actualizar estado" button
  it('does not show a cancelled notice or an update button for a delivered order', () => {
    renderTimeline({ ...mockOrder, status: 'DELIVERED' })

    expect(screen.queryByText('Este pedido ha sido cancelado.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar estado' })).not.toBeInTheDocument()
  })

  // Given an order that was cancelled
  // When the timeline is rendered
  // Then a cancelled notice should be shown, with no "Actualizar estado" button
  it('shows a cancelled notice and no update button when the order was cancelled', () => {
    renderTimeline({ ...mockOrder, status: 'CANCELLED' })

    expect(screen.getByText('Este pedido ha sido cancelado.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar estado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar incidencia' })).not.toBeInTheDocument()
  })

  // Given an order still moving through the normal flow
  // When the user clicks "Actualizar estado"
  // Then it should advance the order to the next status
  it('advances to the next status when clicking "Actualizar estado"', async () => {
    renderTimeline({ ...mockOrder, status: 'PENDING' })

    await userEvent.setup().click(screen.getByRole('button', { name: 'Actualizar estado' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/orders/order-1', { status: 'PREPARING' }),
    )
  })

  // Given the status update fails
  // When the user clicks "Actualizar estado"
  // Then an error message should be shown
  it('shows an error message when updating the status fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('network'))
    renderTimeline({ ...mockOrder, status: 'PENDING' })

    await userEvent.setup().click(screen.getByRole('button', { name: 'Actualizar estado' }))

    expect(
      await screen.findByText('No se ha podido actualizar el estado. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })

  // Given a step the order has already gone past (part of its history)
  // When the user clicks on it
  // Then the order should be reverted directly to that status
  it('reverts to a step when it is clicked', async () => {
    renderTimeline({ ...mockOrder, status: 'PREPARING' })

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Volver a "Pedido recibido"' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/orders/order-1', { status: 'PENDING' }),
    )
  })

  // Given the current step and steps not reached yet
  // When the timeline is rendered
  // Then they should not be clickable (only steps already gone past are)
  it('does not make the current or future steps clickable', () => {
    renderTimeline({ ...mockOrder, status: 'PREPARING' })

    expect(
      screen.queryByRole('button', { name: /Volver a "En preparación"/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Volver a "Enviado"/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Volver a "Entregado"/ })).not.toBeInTheDocument()
  })

  // Given a cancelled order that had already reached PENDING and PREPARING before being
  // cancelled (a mistake the user wants to correct)
  // When the timeline is rendered
  // Then those steps should still be clickable, to reopen the order into the normal flow
  it('keeps steps already reached clickable even once the order is cancelled', async () => {
    renderTimeline({ ...mockOrder, status: 'CANCELLED' })

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Volver a "Pedido recibido"' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/orders/order-1', { status: 'PENDING' }),
    )
  })

  // Given an order that reached PREPARING twice (e.g. advanced, reverted to PENDING, then
  // advanced again) — statusHistory has both PREPARING entries, with different dates
  // When the timeline is rendered
  // Then the PREPARING step should show the most recent date, not the first one
  it('shows the most recent date for a step reached more than once', () => {
    renderTimeline({
      ...mockOrder,
      status: 'PREPARING',
      statusHistory: [
        {
          id: 'change-1',
          status: 'PENDING',
          changedBy: null,
          changedAt: '2026-01-01T12:00:00.000Z',
        },
        {
          id: 'change-2',
          status: 'PREPARING',
          changedBy: null,
          changedAt: '2026-01-01T12:00:00.000Z',
        },
        {
          id: 'change-3',
          status: 'PENDING',
          changedBy: null,
          changedAt: '2026-06-15T12:00:00.000Z',
        },
        {
          id: 'change-4',
          status: 'PREPARING',
          changedBy: null,
          changedAt: '2026-06-20T12:00:00.000Z',
        },
      ],
    })

    expect(screen.getByText('En preparación').nextSibling).toHaveTextContent(/20 jun 2026/)
    expect(screen.getByText('En preparación').nextSibling).not.toHaveTextContent(/ene 2026/)
  })

  // Given an order that was reverted back to PENDING (statusHistory still has the old
  // PREPARING entry — it's never pruned)
  // When the timeline is rendered
  // Then the PREPARING step should show as not reached (dash, not its old date)
  it('shows a step as not reached again after reverting past it, even though its history entry is still there', () => {
    renderTimeline({ ...mockOrder, status: 'PENDING' })

    expect(screen.getByText('En preparación').nextSibling).toHaveTextContent('—')
  })

  // Given an order in incidencia, paused while it was being prepared
  // When the timeline is rendered
  // Then the note and the date are highlighted, and the delivery steps stay in place
  it('shows the incident note without replacing the delivery steps', () => {
    renderTimeline({
      ...mockOrder,
      status: 'INCIDENT',
      statusHistory: [
        ...mockOrder.statusHistory,
        {
          id: 'change-3',
          status: 'INCIDENT',
          changedBy: 'user-1',
          changedAt: '2026-06-20T12:00:00.000Z',
          note: 'El cliente recibió el pedido dañado',
        },
      ],
    })

    expect(screen.getByText('Pedido recibido')).toBeInTheDocument()
    expect(screen.getByText('En preparación')).toBeInTheDocument()
    expect(screen.getByText('El cliente recibió el pedido dañado')).toBeInTheDocument()
    expect(screen.getByText(/20 jun 2026/)).toBeInTheDocument()
    expect(screen.queryByText('Sugerido por IA')).not.toBeInTheDocument()
  })

  // Given an order paused by an incident while it was being prepared
  // When the timeline is rendered
  // Then the step it's paused on shows a warning icon, not the plain green "done" checkmark
  it('shows a paused warning icon instead of a success check on the step an incident paused', () => {
    renderTimeline({
      ...mockOrder,
      status: 'INCIDENT',
      statusHistory: [
        ...mockOrder.statusHistory,
        {
          id: 'change-3',
          status: 'INCIDENT',
          changedBy: 'user-1',
          changedAt: '2026-06-20T12:00:00.000Z',
          note: 'El cliente recibió el pedido dañado',
        },
      ],
    })

    const pausedStepIcon = screen.getByText('En preparación').parentElement!.previousElementSibling!
    expect(pausedStepIcon.className).toContain('bg-error')
    expect(pausedStepIcon.className).not.toContain('bg-success')

    const earlierStepIcon = screen.getByText('Pedido recibido').parentElement!.previousElementSibling!
    expect(earlierStepIcon.className).toContain('bg-success')
  })

  // Given Sincro marked the incident from an email
  // When the timeline is rendered
  // Then the note is shown as suggested by AI, without the raw prefix
  it('marks an incident suggested by AI', () => {
    renderTimeline({
      ...mockOrder,
      status: 'INCIDENT',
      statusHistory: [
        {
          id: 'change-3',
          status: 'INCIDENT',
          changedBy: null,
          changedAt: '2026-06-20T12:00:00.000Z',
          note: 'Sugerido por IA: La caja venía abierta',
        },
      ],
    })

    expect(screen.getByText('Sugerido por IA')).toBeInTheDocument()
    expect(screen.getByText('La caja venía abierta')).toBeInTheDocument()
    expect(screen.queryByText(/Sugerido por IA:/)).not.toBeInTheDocument()
  })

  // Given an incident paused at En preparación
  // When the user resolves it with a note
  // Then the order returns to En preparación with the resolution note
  it('returns to the paused step when resolving the incident', async () => {
    renderTimeline({
      ...mockOrder,
      status: 'INCIDENT',
      statusHistory: [
        ...mockOrder.statusHistory,
        {
          id: 'change-3',
          status: 'INCIDENT',
          changedBy: 'user-1',
          changedAt: '2026-06-20T12:00:00.000Z',
          note: 'Llegó dañado',
        },
      ],
    })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Resolver incidencia' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Cómo se ha resuelto'), 'Se ha reenviado el pedido')
    await user.click(dialog.getByRole('button', { name: 'Resolver incidencia' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/orders/order-1', {
        status: 'PREPARING',
        resolutionNote: 'Se ha reenviado el pedido',
      }),
    )
  })

  // Given an order that had an incident which has since been resolved
  // When the timeline is rendered
  // Then the resolved episode stays visible as a collapsed header, collapsed by default to
  // save space, but its note and resolution note appear once expanded
  it('keeps a resolved incident visible, collapsed by default, with its resolution note', async () => {
    renderTimeline({
      ...mockOrder,
      status: 'PREPARING',
      statusHistory: [
        ...mockOrder.statusHistory,
        {
          id: 'change-3',
          status: 'INCIDENT',
          changedBy: 'user-1',
          changedAt: '2026-06-20T12:00:00.000Z',
          note: 'Llegó dañado',
        },
        {
          id: 'change-4',
          status: 'PREPARING',
          changedBy: 'user-1',
          changedAt: '2026-06-21T12:00:00.000Z',
          note: 'Se ha reenviado el pedido',
        },
      ],
    })

    expect(screen.getByText('Incidencia resuelta')).toBeInTheDocument()
    expect(screen.queryByText('Llegó dañado')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resolver incidencia' })).not.toBeInTheDocument()

    await userEvent.setup().click(screen.getByRole('button', { name: /Incidencia resuelta/ }))

    expect(screen.getByText('Llegó dañado')).toBeInTheDocument()
    expect(screen.getByText('Se ha reenviado el pedido')).toBeInTheDocument()
  })

  // Given an incident paused at En preparación
  // When the user clicks Actualizar estado
  // Then the order leaves the incident and moves on to Enviado
  it('advances past the incident to the next delivery step', async () => {
    renderTimeline({
      ...mockOrder,
      status: 'INCIDENT',
      statusHistory: [
        ...mockOrder.statusHistory,
        {
          id: 'change-3',
          status: 'INCIDENT',
          changedBy: 'user-1',
          changedAt: '2026-06-20T12:00:00.000Z',
          note: 'Llegó dañado',
        },
      ],
    })

    await userEvent.setup().click(screen.getByRole('button', { name: 'Actualizar estado' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/orders/order-1', { status: 'SHIPPED' }),
    )
  })

  // Given a delivered order
  // When the timeline is rendered
  // Then the person can still mark an incident, and there is no next delivery step
  it('offers to mark an incident on a delivered order', () => {
    renderTimeline({ ...mockOrder, status: 'DELIVERED' })

    expect(screen.getByRole('button', { name: 'Marcar incidencia' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar estado' })).not.toBeInTheDocument()
  })
})

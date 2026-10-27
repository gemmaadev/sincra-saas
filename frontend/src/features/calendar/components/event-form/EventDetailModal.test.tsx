import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { EventDetailModal } from './EventDetailModal'
import type { CalendarItem } from '../../types/calendar.types'

function renderModal(props: React.ComponentProps<typeof EventDetailModal>) {
  return render(
    <MantineProvider>
      <EventDetailModal {...props} />
    </MantineProvider>,
  )
}

const manualEvent: CalendarItem = {
  id: 'event-1',
  title: 'Llamar a Juan',
  description: 'Confirmar talla',
  date: '2026-10-15T10:00:00',
  endDate: '2026-10-15T11:00:00',
  source: 'MANUAL',
  clientId: 'client-1',
  clientName: 'Juan',
  orderId: null,
  orderLabel: null,
  orderNumber: null,
  editable: true,
}

const orderEvent: CalendarItem = {
  id: 'order-1',
  title: '#42 - Laura',
  description: null,
  date: '2026-10-20T16:00:00',
  endDate: '2026-10-20T16:00:00',
  source: 'ORDER',
  clientId: 'client-2',
  clientName: 'Laura',
  orderId: 'order-1',
  orderLabel: 'Pedido #42 - Laura',
  orderNumber: 42,
  editable: false,
}

const multiDayEvent: CalendarItem = {
  id: 'event-2',
  title: 'Viaje a proveedor',
  description: null,
  date: '2026-10-15T10:00:00',
  endDate: '2026-10-17T18:00:00',
  source: 'MANUAL',
  clientId: null,
  clientName: null,
  orderId: null,
  orderLabel: null,
  orderNumber: null,
  editable: true,
}

describe('EventDetailModal', () => {
  // Given an editable event with a description and a linked client
  // When the modal is rendered
  // Then its title, description and linked client should be shown
  it('shows the event title, description and linked client', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: manualEvent })

    expect(screen.getByRole('dialog', { name: 'Llamar a Juan' })).toBeInTheDocument()
    expect(screen.getByText('Confirmar talla')).toBeInTheDocument()
    expect(screen.getByText('Juan')).toBeInTheDocument()
  })

  // Given a manual event with a start and end time on the same day
  // When the modal is rendered
  // Then the date should be shown once, followed by both times
  it('shows the date once with both times for a same-day event', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: manualEvent })

    expect(screen.getByText('15 oct 2026, 10:00 – 11:00')).toBeInTheDocument()
  })

  // Given an event spanning several days
  // When the modal is rendered
  // Then the full date and time should be shown for both the start and the end
  it('shows the full date and time for both ends of a multi-day event', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: multiDayEvent })

    expect(screen.getByText('15 oct 2026, 10:00 – 17 oct 2026, 18:00')).toBeInTheDocument()
  })

  // Given an order's own expectedDate, which has no real duration
  // When the modal is rendered
  // Then just that single moment should be shown, without a dash
  it('shows a single moment for a zero-duration order event', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: orderEvent })

    expect(screen.getByText('20 oct 2026, 16:00')).toBeInTheDocument()
  })

  // Given an event with no description
  // When the modal is rendered
  // Then a placeholder should be shown instead of an empty section
  it('shows a placeholder when there is no description', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: orderEvent })

    expect(screen.getByText('Sin descripción.')).toBeInTheDocument()
  })

  // Given an editable event
  // When the modal is rendered
  // Then an "Editar" button should be shown
  it('shows the edit button for an editable event', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: manualEvent })

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  // Given a non-editable event (an order's own expectedDate)
  // When the modal is rendered
  // Then no "Editar" button should be shown, since it can't be edited from the calendar
  it('hides the edit button for a non-editable event', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: orderEvent })

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  // Given the preview is open
  // When the user clicks "Editar"
  // Then onEdit should be called
  it('calls onEdit when "Editar" is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    renderModal({ opened: true, onClose: vi.fn(), onEdit, onDelete: vi.fn(), event: manualEvent })

    await user.click(screen.getByRole('button', { name: 'Editar' }))

    expect(onEdit).toHaveBeenCalledOnce()
  })

  // Given an editable event
  // When the modal is rendered
  // Then an "Eliminar" button should be shown
  it('shows the delete button for an editable event', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: manualEvent })

    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  // Given a non-editable event (an order's own expectedDate)
  // When the modal is rendered
  // Then no "Eliminar" button should be shown, since there's no CalendarEvent row to delete
  it('hides the delete button for a non-editable event', () => {
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), event: orderEvent })

    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
  })

  // Given the preview is open
  // When the user clicks "Eliminar"
  // Then onDelete should be called
  it('calls onDelete when "Eliminar" is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderModal({ opened: true, onClose: vi.fn(), onEdit: vi.fn(), onDelete, event: manualEvent })

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(onDelete).toHaveBeenCalledOnce()
  })

  // Given the preview is open
  // When the user clicks "Cancelar"
  // Then onClose should be called
  it('calls onClose when "Cancelar" is clicked', () => {
    const onClose = vi.fn()
    renderModal({ opened: true, onClose, onEdit: vi.fn(), onDelete: vi.fn(), event: manualEvent })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})

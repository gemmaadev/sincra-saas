import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { EventDetailModal } from './EventDetailModal'
import type { CalendarItem } from '../types/calendar.types'

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
  date: '2026-10-15T10:00:00.000Z',
  endDate: '2026-10-15T11:00:00.000Z',
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
  date: '2026-10-20T16:00:00.000Z',
  endDate: '2026-10-20T16:00:00.000Z',
  source: 'ORDER',
  clientId: 'client-2',
  clientName: 'Laura',
  orderId: 'order-1',
  orderLabel: 'Pedido #42 - Laura',
  orderNumber: 42,
  editable: false,
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

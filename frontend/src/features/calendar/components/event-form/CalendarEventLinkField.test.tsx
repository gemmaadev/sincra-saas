import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { CalendarEventLinkField } from './CalendarEventLinkField'

function renderField(overrides: Partial<Parameters<typeof CalendarEventLinkField>[0]> = {}) {
  const props = {
    linkType: 'none' as const,
    clientName: '',
    orderLabel: '',
    onLinkTypeChange: vi.fn(),
    onSelectClient: vi.fn(),
    onSelectOrder: vi.fn(),
    onClearSelection: vi.fn(),
    ...overrides,
  }
  render(withQueryClient(<CalendarEventLinkField {...props} />))
  return props
}

describe('CalendarEventLinkField', () => {
  // Given linkType is "none"
  // When the field is rendered
  // Then only the toggle should be shown, with "Ninguno" pressed
  it('marks "Ninguno" as pressed and shows no search when linkType is none', () => {
    renderField({ linkType: 'none' })

    expect(screen.getByRole('button', { name: 'Ninguno' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByLabelText('Buscar cliente')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Buscar pedido')).not.toBeInTheDocument()
  })

  // Given the toggle is rendered
  // When the user clicks "Cliente"
  // Then onLinkTypeChange should be called with "client"
  it('calls onLinkTypeChange when a toggle option is clicked', async () => {
    const user = userEvent.setup()
    const { onLinkTypeChange } = renderField()

    await user.click(screen.getByRole('button', { name: 'Cliente' }))

    expect(onLinkTypeChange).toHaveBeenCalledWith('client')
  })

  // Given linkType is "client" with no client selected yet
  // When the field is rendered
  // Then the client search should be shown
  it('shows the client search when linked to a client with no selection', () => {
    renderField({ linkType: 'client', clientName: '' })

    expect(screen.getByLabelText('Buscar cliente')).toBeInTheDocument()
  })

  // Given linkType is "client" with a client already selected
  // When the field is rendered
  // Then it should show the client's name as a chip, not the search
  it('shows the selected client as a chip instead of the search', () => {
    renderField({ linkType: 'client', clientName: 'Laura García' })

    expect(screen.getByText('Laura García')).toBeInTheDocument()
    expect(screen.queryByLabelText('Buscar cliente')).not.toBeInTheDocument()
  })

  // Given a client chip is shown
  // When the user clicks "Cambiar"
  // Then onClearSelection should be called
  it('calls onClearSelection when "Cambiar" is clicked on the client chip', async () => {
    const user = userEvent.setup()
    const { onClearSelection } = renderField({ linkType: 'client', clientName: 'Laura García' })

    await user.click(screen.getByRole('button', { name: 'Cambiar' }))

    expect(onClearSelection).toHaveBeenCalledOnce()
  })

  // Given linkType is "order" with an order already selected
  // When the field is rendered
  // Then it should show the order label as a chip, not the search
  it('shows the selected order as a chip instead of the search', () => {
    renderField({ linkType: 'order', orderLabel: 'Pedido #42 - Laura García' })

    expect(screen.getByText('Pedido #42 - Laura García')).toBeInTheDocument()
    expect(screen.queryByLabelText('Buscar pedido')).not.toBeInTheDocument()
  })

  // Given linkType is "order" with no order selected yet
  // When the field is rendered
  // Then the order search should be shown
  it('shows the order search when linked to an order with no selection', () => {
    renderField({ linkType: 'order', orderLabel: '' })

    expect(screen.getByLabelText('Buscar pedido')).toBeInTheDocument()
  })
})

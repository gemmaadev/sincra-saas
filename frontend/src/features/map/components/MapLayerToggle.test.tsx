import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MapLayerToggle } from './MapLayerToggle'

describe('MapLayerToggle', () => {
  // Given the clients layer is active
  // When the toggle is rendered
  // Then only "Clientes" should be marked as pressed
  it('marks the active layer as pressed', () => {
    render(<MapLayerToggle layer="clients" onLayerChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Clientes' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Pedidos' })).toHaveAttribute('aria-pressed', 'false')
  })

  // Given the toggle is rendered with the clients layer active
  // When the user clicks "Pedidos"
  // Then onLayerChange should be called with the orders layer
  it('notifies the new layer when clicked', async () => {
    const user = userEvent.setup()
    const onLayerChange = vi.fn()
    render(<MapLayerToggle layer="clients" onLayerChange={onLayerChange} />)

    await user.click(screen.getByRole('button', { name: 'Pedidos' }))

    expect(onLayerChange).toHaveBeenCalledWith('orders')
  })

  // Given the orders layer is already active
  // When the toggle is rendered
  // Then every button should still be clickable
  it('keeps every layer clickable', () => {
    render(<MapLayerToggle layer="orders" onLayerChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Clientes' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Pedidos' })).not.toBeDisabled()
  })
})

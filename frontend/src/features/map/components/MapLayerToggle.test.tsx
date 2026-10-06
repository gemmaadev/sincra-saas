import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MapLayerToggle } from './MapLayerToggle'

describe('MapLayerToggle', () => {
  // Given the orders module does not exist yet
  // When the toggle is rendered
  // Then "Clientes" should be the active layer
  it('has the clients layer active', () => {
    render(<MapLayerToggle />)

    expect(screen.getByRole('button', { name: 'Clientes' })).toHaveAttribute('aria-pressed', 'true')
  })

  // Given the orders module does not exist yet
  // When the toggle is rendered
  // Then the orders layers should be disabled
  it('disables the orders layers', () => {
    render(<MapLayerToggle />)

    expect(screen.getByRole('button', { name: 'Pedidos' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Ambos' })).toBeDisabled()
  })
})

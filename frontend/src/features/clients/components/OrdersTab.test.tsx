import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OrdersTab } from './OrdersTab'

describe('OrdersTab', () => {
  // Given the Order module doesn't exist yet
  // When OrdersTab is rendered
  // Then it should explain it's blocked, not broken
  it('explains the feature is blocked by the Order module', () => {
    render(<OrdersTab />)
    expect(screen.getByText('Disponible cuando exista el módulo de pedidos')).toBeInTheDocument()
  })
})

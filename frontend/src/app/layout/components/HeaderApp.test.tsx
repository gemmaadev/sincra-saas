import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HeaderApp } from './HeaderApp'

describe('HeaderApp', () => {
  // Given the HeaderApp component
  // When it is rendered
  // Then the search input and the user's avatar should be visible
  it('renders the search input and the user avatar', () => {
    render(<HeaderApp />)
    expect(
      screen.getByPlaceholderText('Buscar conversaciones, clientes, pedidos...'),
    ).toBeInTheDocument()
    expect(screen.getByText('LG')).toBeInTheDocument() // iniciales del Avatar
  })
})

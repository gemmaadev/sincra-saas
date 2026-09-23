import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppHeader } from './AppHeader'
import { MemoryRouter } from 'react-router'

describe('HeaderApp', () => {
  // Given the HeaderApp component
  // When it is rendered
  // Then the search input and the user's avatar should be visible
  it('renders the search input and the user avatar', () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )
    expect(
      screen.getByPlaceholderText('Buscar conversaciones, clientes, pedidos...'),
    ).toBeInTheDocument()
    expect(screen.getByText('LG')).toBeInTheDocument()
  })
})

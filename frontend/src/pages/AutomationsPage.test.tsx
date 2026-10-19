import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AutomationsPage from './AutomationsPage'

describe('AutomationsPage', () => {
  // Given the AutomationsPage
  // When it is rendered
  // Then the title and intro should be visible
  it('renders the page title and intro', () => {
    render(<AutomationsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Agentes IA' })).toBeInTheDocument()
    expect(
      screen.getByText(/Sincra revisa tus mensajes y detecta clientes y pedidos nuevos/),
    ).toBeInTheDocument()
  })

  // Given the AutomationsPage
  // When it is rendered
  // Then both Sincra and Sincro should have their own agent card
  it('renders a card for each agent', () => {
    render(<AutomationsPage />)

    expect(screen.getByRole('heading', { level: 2, name: 'Sincra' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Sincro' })).toBeInTheDocument()
  })

  // Given the AutomationsPage
  // When it is rendered
  // Then the "Sugerido por IA" disclaimer should be visible
  it('renders the AI-suggested disclaimer', () => {
    render(<AutomationsPage />)

    expect(screen.getByText('"Sugerido por IA"')).toBeInTheDocument()
  })
})

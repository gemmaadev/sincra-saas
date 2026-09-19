import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  // Given the Sidebar component
  // When it is rendered
  // Then all navigation items, channels and labels should be visible
  it('renders all nav items, channels and labels', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )
    expect(screen.getByText('Bandeja')).toBeInTheDocument()
    expect(screen.getByText('Ajustes')).toBeInTheDocument()
    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('Nuevo cliente')).toBeInTheDocument()
  })
})

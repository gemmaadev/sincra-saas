import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ClientsTableSkeleton } from './ClientsTableSkeleton'

describe('ClientsTableSkeleton', () => {
  // Given the clients table is loading
  // When ClientsTableSkeleton is rendered
  // Then it should show the same column headers as the real table
  it('shows the real table column headers', () => {
    render(<ClientsTableSkeleton />)
    expect(screen.getByText('Cliente')).toBeInTheDocument()
    expect(screen.getByText('Canales')).toBeInTheDocument()
    expect(screen.getByText('Etiquetas')).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('Última actividad')).toBeInTheDocument()
  })

  // Given the clients table is loading
  // When ClientsTableSkeleton is rendered
  // Then the table should be marked as busy for assistive technology
  it('marks the table as busy', () => {
    render(<ClientsTableSkeleton />)
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
  })
})

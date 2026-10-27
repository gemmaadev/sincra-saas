import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner, PageSpinner } from './Spinner'

describe('Spinner', () => {
  // Given a Spinner with no props
  // When it is rendered
  // Then it should expose an accessible "Cargando" status role
  it('renders with an accessible default label', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument()
  })

  // Given a Spinner with a custom label
  // When it is rendered
  // Then the accessible name should use that label instead
  it('renders with a custom accessible label', () => {
    render(<Spinner label="Cargando pedidos" />)
    expect(screen.getByRole('status', { name: 'Cargando pedidos' })).toBeInTheDocument()
  })
})

describe('PageSpinner', () => {
  // Given a PageSpinner
  // When it is rendered
  // Then it should show a centered, accessible loading status
  it('renders a centered spinner', () => {
    render(<PageSpinner label="Cargando negocio" />)
    expect(screen.getByRole('status', { name: 'Cargando negocio' })).toBeInTheDocument()
  })
})

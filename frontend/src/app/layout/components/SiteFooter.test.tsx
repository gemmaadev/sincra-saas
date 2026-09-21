import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  // Given the SiteFooter
  // When it is rendered
  // Then the copyright notice should be visible
  it('renders the copyright notice', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Todos los derechos reservados/)).toBeInTheDocument()
  })
})

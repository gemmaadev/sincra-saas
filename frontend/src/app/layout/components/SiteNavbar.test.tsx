import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { SiteNavbar } from './SiteNavbar'

describe('SiteNavbar', () => {
  // Given the SiteNavbar
  // When it is rendered
  // Then the logo and the register button should be visible
  it('renders the logo and the register button', () => {
    render(
      <MemoryRouter>
        <SiteNavbar />
      </MemoryRouter>,
    )
    expect(screen.getByText('Sincra')).toBeInTheDocument()
    expect(screen.getByText('Registrarse')).toBeInTheDocument()
  })
})

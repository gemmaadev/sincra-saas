import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { CtaSection } from './CtaSection'

describe('CtaSection', () => {
  // Given the CtaSection
  // When it is rendered
  // Then the call-to-action message and button should be visible
  it('renders the CTA message and button', () => {
    render(
      <MemoryRouter>
        <CtaSection />
      </MemoryRouter>,
    )
    expect(screen.getByText(/¿Listo para centralizar/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Empezar ahora' })).toBeInTheDocument()
  })
})

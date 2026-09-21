import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { PricingSection } from './PricingSection'

describe('PricingSection', () => {
  // Given the PricingSection
  // When it is rendered
  // Then the price and the founder pricing badge should be visible
  it('renders the price and the founder pricing info', () => {
    render(
      <MemoryRouter>
        <PricingSection />
      </MemoryRouter>,
    )
    expect(screen.getByText(/60\s?€/)).toBeInTheDocument()
    expect(screen.getByText('Precio fundador')).toBeInTheDocument()
  })
})

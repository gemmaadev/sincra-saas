import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FeaturesSection } from './FeaturesSection'

describe('FeaturesSection', () => {
  // Given the FeaturesSection
  // When it is rendered
  // Then the title and all 8 feature cards should be visible
  it('renders the title and all feature cards', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Diseñada para tu día a día')).toBeInTheDocument()
    expect(screen.getByText('Inbox unificado')).toBeInTheDocument()
    expect(screen.getByText('Asistente de IA')).toBeInTheDocument()
  })
})

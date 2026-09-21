import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DemoSection } from './DemoSection'

describe('DemoSection', () => {
  // Given the DemoSection
  // When it is rendered
  // Then the title and the play button should be visible
  it('renders the title and the play button', () => {
    render(<DemoSection />)
    expect(screen.getByText('Descubre cómo funciona en 2 minutos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reproducir vídeo demo' })).toBeInTheDocument()
  })
})

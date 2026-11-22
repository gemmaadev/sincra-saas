import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AiAgentsSection } from './AiAgentsSection'

describe('AiAgentsSection', () => {
  // Given the AiAgentsSection
  // When it is rendered
  // Then the title and both agent cards should be visible
  it('renders the title and both agents', () => {
    render(<AiAgentsSection />)
    expect(screen.getByText('Sincra y Sincro, tus agentes de IA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sincra' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sincro' })).toBeInTheDocument()
  })
})

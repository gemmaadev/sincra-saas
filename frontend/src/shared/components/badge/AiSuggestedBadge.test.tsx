import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AiSuggestedBadge } from './AiSuggestedBadge'

describe('AiSuggestedBadge', () => {
  // Given something suggested by the AI
  // When the badge is rendered
  // Then it should say so in text
  it('shows the "Sugerido por IA" label', () => {
    render(<AiSuggestedBadge />)

    expect(screen.getByText('Sugerido por IA')).toBeInTheDocument()
  })
})

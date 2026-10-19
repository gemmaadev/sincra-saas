import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AgentFlowBanner } from './AgentFlowBanner'
import { AI_AGENTS } from '../automations.constants'

describe('AgentFlowBanner', () => {
  // Given the AI agents
  // When the banner is rendered
  // Then both agents' name, role and avatar should be visible
  it('renders both agents', () => {
    const { container } = render(<AgentFlowBanner />)

    for (const agent of AI_AGENTS) {
      expect(screen.getByText(agent.name)).toBeInTheDocument()
      expect(screen.getByText(agent.role)).toBeInTheDocument()
      expect(container.querySelector(`img[src="${agent.avatar}"]`)).toBeInTheDocument()
    }
  })
})

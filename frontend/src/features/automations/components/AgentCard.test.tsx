import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AgentCard } from './AgentCard'
import type { AiAgent } from '../automations.constants'

const mockAgent: AiAgent = {
  id: 'sincra',
  name: 'Sincra',
  role: 'Lee tus mensajes por ti',
  tagline: 'Encuentra clientes y pedidos nuevos antes de que tengas que buscarlos.',
  avatar: '/avatar-sincra-agent.png',
  description: 'Revisa los mensajes que te llegan de todos los sitios.',
  capabilities: ['Detecta clientes nuevos', 'Detecta pedidos nuevos'],
}

describe('AgentCard', () => {
  // Given an agent
  // When the card is rendered
  // Then its name, role, description and avatar should be visible
  it('renders the agent identity', () => {
    render(<AgentCard agent={mockAgent} />)

    expect(screen.getByRole('heading', { name: 'Sincra' })).toBeInTheDocument()
    expect(screen.getByText('Lee tus mensajes por ti')).toBeInTheDocument()
    expect(screen.getByText('Revisa los mensajes que te llegan de todos los sitios.')).toBeInTheDocument()
    expect(screen.getByAltText('')).toHaveAttribute('src', '/avatar-sincra-agent.png')
  })

  // Given an agent with several capabilities
  // When the card is rendered
  // Then every capability should be listed
  it('renders every capability', () => {
    render(<AgentCard agent={mockAgent} />)

    for (const capability of mockAgent.capabilities) {
      expect(screen.getByText(capability)).toBeInTheDocument()
    }
  })
})

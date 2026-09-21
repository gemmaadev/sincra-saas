import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChannelsSection } from './ChannelsSection'

describe('ChannelsSection', () => {
  // Given the ChannelsSection
  // When it is rendered
  // Then the title and all 5 channel labels should be visible
  it('renders the title and all channel labels', () => {
    render(<ChannelsSection />)
    expect(screen.getByText(/Todos los canales/)).toBeInTheDocument()
    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Messenger')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChannelIcons } from './ChannelIcons'

describe('ChannelIcons', () => {
  // Given a client with WhatsApp and Gmail
  // When ChannelIcons is rendered
  // Then each channel should show its brand icon with an accessible name
  it('shows one labelled icon per known channel', () => {
    render(<ChannelIcons channels={['WHATSAPP', 'GMAIL']} />)

    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Gmail')).toBeInTheDocument()
  })

  // Given a channel that has no brand icon
  // When ChannelIcons is rendered
  // Then its raw name should be shown as text
  it('shows the raw name for an unknown channel', () => {
    render(<ChannelIcons channels={['TELEGRAM']} />)

    expect(screen.getByText('TELEGRAM')).toBeInTheDocument()
  })
})

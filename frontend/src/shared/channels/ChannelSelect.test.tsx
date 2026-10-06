import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ChannelSelect } from './ChannelSelect'

describe('ChannelSelect', () => {
  // Given the select is rendered
  // When its options are read
  // Then it should offer "Todos" plus every channel by name
  it('offers every channel plus "Todos"', () => {
    render(<ChannelSelect id="channel" value="" onChange={vi.fn()} />)

    const optionNames = screen.getAllByRole('option').map((option) => option.textContent)

    expect(optionNames).toEqual(['Todos', 'Gmail', 'Outlook', 'WhatsApp', 'Instagram', 'Messenger'])
  })

  // Given a selected channel
  // When the select is rendered
  // Then it should show that channel as the current value
  it('shows the current value', () => {
    render(<ChannelSelect id="channel" value="WHATSAPP" onChange={vi.fn()} />)

    expect(screen.getByLabelText('Canal')).toHaveValue('WHATSAPP')
  })

  // Given the select is rendered
  // When the user picks a channel
  // Then onChange should receive its upper-case code
  it('reports the code of the chosen channel', async () => {
    const onChange = vi.fn()
    render(<ChannelSelect id="channel" value="" onChange={onChange} />)

    await userEvent.setup().selectOptions(screen.getByLabelText('Canal'), 'INSTAGRAM')

    expect(onChange).toHaveBeenCalledWith('INSTAGRAM')
  })
})

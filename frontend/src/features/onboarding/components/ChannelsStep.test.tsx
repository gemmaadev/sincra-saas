import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChannelsStep } from './ChannelsStep'

describe('ChannelsStep', () => {
  it('Scenario: no channels connected yet', () => {
    // Given no channel has been connected
    // When the step renders
    // Then every channel shows a "Conectar" button
    render(
      <ChannelsStep connectedChannels={[]} onChange={vi.fn()} onBack={vi.fn()} onNext={vi.fn()} />,
    )

    const connectButtons = screen.getAllByRole('button', { name: 'Conectar' })
    expect(connectButtons).toHaveLength(5)
  })

  it('Scenario: mocked channels do not start pre-connected', () => {
    // Given a mocked channel (WhatsApp)
    // When the step renders without the user connecting anything
    // Then it must not appear as connected — mocked and real channels
    // behave identically until the user explicitly clicks "Conectar"
    render(
      <ChannelsStep connectedChannels={[]} onChange={vi.fn()} onBack={vi.fn()} onNext={vi.fn()} />,
    )

    expect(screen.queryByLabelText('Desconectar WhatsApp')).not.toBeInTheDocument()
  })

  it('Scenario: connecting a channel', async () => {
    // Given a disconnected channel (Gmail)
    // When the user clicks "Conectar" on that channel
    // Then onChange is called with that channel added to the list
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ChannelsStep
        connectedChannels={[]}
        onChange={handleChange}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    )

    const gmailCard = screen.getByText('Gmail').closest('div[class*="rounded-xl"]') as HTMLElement
    const connectButton = within(gmailCard).getByRole('button', { name: 'Conectar' })
    await user.click(connectButton)

    expect(handleChange).toHaveBeenCalledWith(['gmail'])
  })

  it('Scenario: disconnecting a channel', async () => {
    // Given a channel that is already connected (Gmail, alongside Outlook)
    // When the user clicks the connected check for that channel
    // Then onChange is called with that channel removed from the list
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ChannelsStep
        connectedChannels={['gmail', 'outlook']}
        onChange={handleChange}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    )

    const disconnectButton = screen.getByRole('button', { name: 'Desconectar Gmail' })
    await user.click(disconnectButton)

    expect(handleChange).toHaveBeenCalledWith(['outlook'])
  })

  it('Scenario: a connected channel is shown as a check, not a button', () => {
    // Given a connected channel (Gmail)
    // When the step renders
    // Then it shows a "disconnect" control instead of a "Conectar" button,
    // and the other four channels still show "Conectar"
    render(
      <ChannelsStep
        connectedChannels={['gmail']}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Desconectar Gmail' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Conectar' })).toHaveLength(4)
  })

  it('Scenario: going back to the previous step', async () => {
    // Given the user is on the channels step
    // When the user clicks "Volver"
    // Then onBack is called
    const user = userEvent.setup()
    const handleBack = vi.fn()

    render(
      <ChannelsStep
        connectedChannels={[]}
        onChange={vi.fn()}
        onBack={handleBack}
        onNext={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(handleBack).toHaveBeenCalledOnce()
  })

  it('Scenario: moving on to the next step', async () => {
    // Given the user is on the channels step
    // When the user clicks "Siguiente"
    // Then onNext is called
    const user = userEvent.setup()
    const handleNext = vi.fn()

    render(
      <ChannelsStep
        connectedChannels={[]}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onNext={handleNext}
      />,
    )

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(handleNext).toHaveBeenCalledOnce()
  })
})

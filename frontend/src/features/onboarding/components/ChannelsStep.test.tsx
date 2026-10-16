import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChannelsStep } from './ChannelsStep'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { post: vi.fn() } }
})

function renderChannelsStep(props: Partial<React.ComponentProps<typeof ChannelsStep>> = {}) {
  render(
    withQueryClient(
      <ChannelsStep
        connectedChannels={[]}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onNext={vi.fn()}
        {...props}
      />,
    ),
  )
}

describe('ChannelsStep', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset().mockResolvedValue({})
  })

  it('Scenario: no channels connected yet', () => {
    // Given no channel has been connected
    // When the step renders
    // Then every channel shows a "Conectar" button
    renderChannelsStep()

    const connectButtons = screen.getAllByRole('button', { name: 'Conectar' })
    expect(connectButtons).toHaveLength(5)
  })

  it('Scenario: mocked channels do not start pre-connected', () => {
    // Given a mocked channel (WhatsApp)
    // When the step renders without the user connecting anything
    // Then it must not appear as connected — mocked and real channels
    // behave identically until the user explicitly clicks "Conectar"
    renderChannelsStep()

    expect(screen.queryByLabelText('Desconectar WhatsApp')).not.toBeInTheDocument()
  })

  it('Scenario: connecting a channel', async () => {
    // Given a disconnected channel (Gmail)
    // When the user clicks "Conectar" on that channel
    // Then onChange is called with that channel added to the list
    const user = userEvent.setup()
    const handleChange = vi.fn()

    renderChannelsStep({ onChange: handleChange })

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

    renderChannelsStep({ connectedChannels: ['gmail', 'outlook'], onChange: handleChange })

    const disconnectButton = screen.getByRole('button', { name: 'Desconectar Gmail' })
    await user.click(disconnectButton)

    expect(handleChange).toHaveBeenCalledWith(['outlook'])
  })

  it('Scenario: a connected channel is shown as a check, not a button', () => {
    // Given a connected channel (Gmail)
    // When the step renders
    // Then it shows a "disconnect" control instead of a "Conectar" button,
    // and the other four channels still show "Conectar"
    renderChannelsStep({ connectedChannels: ['gmail'] })

    expect(screen.getByRole('button', { name: 'Desconectar Gmail' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Conectar' })).toHaveLength(4)
  })

  it('Scenario: going back to the previous step', async () => {
    // Given the user is on the channels step
    // When the user clicks "Volver"
    // Then onBack is called
    const user = userEvent.setup()
    const handleBack = vi.fn()

    renderChannelsStep({ onBack: handleBack })

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(handleBack).toHaveBeenCalledOnce()
  })

  it('Scenario: moving on to the next step', async () => {
    // Given the user is on the channels step
    // When the user clicks "Siguiente"
    // Then onNext is called
    const user = userEvent.setup()
    const handleNext = vi.fn()

    renderChannelsStep({ onNext: handleNext })

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(handleNext).toHaveBeenCalledOnce()
  })

  it('Scenario: connecting Gmail persists it to the backend', async () => {
    // Given a disconnected channel with a real integration (Gmail)
    // When the user clicks "Conectar"
    // Then it should POST to /channels/connect with the uppercase channel name
    const user = userEvent.setup()

    renderChannelsStep()

    const gmailCard = screen.getByText('Gmail').closest('div[class*="rounded-xl"]') as HTMLElement
    await user.click(within(gmailCard).getByRole('button', { name: 'Conectar' }))

    expect(api.post).toHaveBeenCalledWith('/channels/connect', { channel: 'GMAIL' })
  })

  it('Scenario: disconnecting Outlook persists it to the backend', async () => {
    // Given a connected real channel (Outlook)
    // When the user clicks to disconnect it
    // Then it should POST to /channels/disconnect
    const user = userEvent.setup()

    renderChannelsStep({ connectedChannels: ['outlook'] })

    await user.click(screen.getByRole('button', { name: 'Desconectar Outlook' }))

    expect(api.post).toHaveBeenCalledWith('/channels/disconnect', { channel: 'OUTLOOK' })
  })

  it('Scenario: toggling a mocked channel does not call the backend', async () => {
    // Given a mocked channel (WhatsApp) with no real integration
    // When the user clicks "Conectar"
    // Then no request should be sent — the status is always MOCKED regardless
    const user = userEvent.setup()

    renderChannelsStep()

    const whatsappCard = screen
      .getByText('WhatsApp')
      .closest('div[class*="rounded-xl"]') as HTMLElement
    await user.click(within(whatsappCard).getByRole('button', { name: 'Conectar' }))

    expect(api.post).not.toHaveBeenCalled()
  })
})

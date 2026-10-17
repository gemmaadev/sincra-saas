import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { ConnectedChannelsCard } from './ConnectedChannelsCard'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn() } }
})

const mockChannels = [
  { channel: 'GMAIL', status: 'CONNECTED' },
  { channel: 'OUTLOOK', status: 'DISCONNECTED' },
  { channel: 'WHATSAPP', status: 'MOCKED' },
  { channel: 'INSTAGRAM', status: 'MOCKED' },
  { channel: 'MESSENGER', status: 'MOCKED' },
]

function renderCard(canEdit = true) {
  render(withQueryClient(<ConnectedChannelsCard canEdit={canEdit} />))
  return { user: userEvent.setup() }
}

describe('ConnectedChannelsCard', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset().mockResolvedValue({ channels: mockChannels })
    vi.mocked(api.post).mockReset().mockResolvedValue({})
  })

  // Given the channels endpoint resolves
  // When the card renders
  // Then each channel's real/mocked status should be reflected in its control
  it('renders the real status for Gmail/Outlook and "no disponible" for mocked channels', async () => {
    renderCard()

    expect(await screen.findByRole('button', { name: 'Desconectar Gmail' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Conectar' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Conectar WhatsApp (no disponible)' }),
    ).toBeInTheDocument()
  })

  // Given Gmail is connected
  // When an admin clicks to disconnect it
  // Then it should POST to /channels/disconnect
  it('disconnects a connected channel', async () => {
    const { user } = renderCard()

    await user.click(await screen.findByRole('button', { name: 'Desconectar Gmail' }))

    expect(api.post).toHaveBeenCalledWith('/channels/disconnect', { channel: 'GMAIL' })
  })

  // Given Outlook is disconnected
  // When an admin clicks "Conectar"
  // Then it should POST to /channels/connect
  it('connects a disconnected channel', async () => {
    const { user } = renderCard()

    await user.click(await screen.findByRole('button', { name: 'Conectar' }))

    expect(api.post).toHaveBeenCalledWith('/channels/connect', { channel: 'OUTLOOK' })
  })

  // Given a non-admin viewing the channels
  // When the card renders
  // Then the connect/disconnect controls should be disabled
  it('disables the controls for a non-admin', async () => {
    renderCard(false)

    expect(await screen.findByRole('button', { name: 'Desconectar Gmail' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Conectar' })).toBeDisabled()
  })
})

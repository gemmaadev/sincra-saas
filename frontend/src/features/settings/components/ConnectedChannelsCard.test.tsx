import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { googleOauth, succeedGoogleLogin } from '@/shared/test/googleOauth'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { notifyError } from '@/shared/utils/notify'
import { ConnectedChannelsCard } from './ConnectedChannelsCard'

vi.mock('@react-oauth/google', async () => {
  const { googleOauthModule } = await import('@/shared/test/googleOauth')
  return googleOauthModule()
})

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifyError: vi.fn() }))

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

function channelRow(name: string) {
  return screen.getByText(name).closest('div.justify-between') as HTMLElement
}

describe('ConnectedChannelsCard', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset().mockResolvedValue({ channels: mockChannels })
    vi.mocked(api.post).mockReset().mockResolvedValue({})
    vi.mocked(notifyError).mockReset()
    succeedGoogleLogin()
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
    expect(googleOauth.trigger).not.toHaveBeenCalled()
  })

  // Given Gmail is disconnected
  // When an admin connects it and Google returns a token
  // Then it should POST that token with the Gmail channel
  it('sends the Google access token when connecting Gmail', async () => {
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'GMAIL' ? { ...channel, status: 'DISCONNECTED' } : channel,
      ),
    })
    const { user } = renderCard()

    await screen.findByText('Gmail')
    await user.click(within(channelRow('Gmail')).getByRole('button', { name: 'Conectar' }))

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/channels/connect', {
        channel: 'GMAIL',
        accessToken: 'google-token',
      }),
    )
  })

  // Given the user closes the Google window
  // When they try to connect Gmail
  // Then nothing is saved and a toast explains the cancellation
  it('shows an error toast when the Google prompt is cancelled', async () => {
    googleOauth.trigger.mockImplementation(() => {
      googleOauth.options.current?.onNonOAuthError()
    })
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'GMAIL' ? { ...channel, status: 'DISCONNECTED' } : channel,
      ),
    })
    const { user } = renderCard()

    await screen.findByText('Gmail')
    await user.click(within(channelRow('Gmail')).getByRole('button', { name: 'Conectar' }))

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith('Has cancelado la conexión con Google.'),
    )
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given Google cannot issue a token
  // When the user tries to connect Gmail
  // Then nothing is saved and a toast explains the failure
  it('shows an error toast when Google fails to return a token', async () => {
    googleOauth.trigger.mockImplementation(() => {
      googleOauth.options.current?.onError()
    })
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'GMAIL' ? { ...channel, status: 'DISCONNECTED' } : channel,
      ),
    })
    const { user } = renderCard()

    await screen.findByText('Gmail')
    await user.click(within(channelRow('Gmail')).getByRole('button', { name: 'Conectar' }))

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        'No se ha podido conectar con Google. Inténtalo de nuevo.',
      ),
    )
    expect(api.post).not.toHaveBeenCalled()
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

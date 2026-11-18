import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { notifyError } from '@/shared/utils/notify'
import { ConnectedChannelsCard } from './ConnectedChannelsCard'

const googleLogin = vi.hoisted(() => ({ cancel: false, hint: undefined as string | undefined }))

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
  useGoogleLogin: (options: {
    onSuccess: (response: { access_token: string }) => void
    onNonOAuthError: () => void
  }) => {
    return (override?: { hint?: string }) => {
      googleLogin.hint = override?.hint
      return googleLogin.cancel
        ? options.onNonOAuthError()
        : options.onSuccess({ access_token: 'google-access-token' })
    }
  },
}))

vi.mock('@/shared/utils/notify', () => ({ notifyError: vi.fn() }))

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn() } }
})

const mockChannels = [
  { channel: 'GMAIL', status: 'CONNECTED', accountEmail: 'tienda@gmail.com' },
  { channel: 'OUTLOOK', status: 'DISCONNECTED' },
  { channel: 'WHATSAPP', status: 'MOCKED' },
  { channel: 'INSTAGRAM', status: 'MOCKED' },
  { channel: 'MESSENGER', status: 'MOCKED' },
]

function renderCard(canEdit = true) {
  render(
    withQueryClient(
      <MantineProvider>
        <ConnectedChannelsCard canEdit={canEdit} />
      </MantineProvider>,
    ),
  )
  return { user: userEvent.setup() }
}

async function confirmEmail(
  user: ReturnType<typeof userEvent.setup>,
  dialogName: string,
  email: string,
  buttonName: string,
) {
  const dialog = await screen.findByRole('dialog', { name: dialogName })
  await user.type(within(dialog).getByLabelText('Email'), email)
  await user.click(within(dialog).getByRole('button', { name: buttonName }))
}

function connectButton(channelName: string) {
  const row = screen.getByText(channelName).closest('div.justify-between') as HTMLElement
  return within(row).getByRole('button', { name: 'Conectar' })
}

describe('ConnectedChannelsCard', () => {
  beforeEach(() => {
    googleLogin.cancel = false
    googleLogin.hint = undefined
    vi.mocked(api.get).mockReset().mockResolvedValue({ channels: mockChannels })
    vi.mocked(api.post).mockReset().mockResolvedValue({})
    vi.mocked(notifyError).mockReset()
  })

  // Given the channels endpoint resolves
  // When the card renders
  // Then each channel's real/mocked status should be reflected in its control
  it('renders the real status for Gmail/Outlook and "no disponible" for mocked channels', async () => {
    renderCard()

    expect(await screen.findByRole('button', { name: 'Desconectar Gmail' })).toBeInTheDocument()
    expect(screen.getByText('Conectado como tienda@gmail.com')).toBeInTheDocument()
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
  // When an admin confirms a valid email in the modal
  // Then it connects that channel and stores the lowercase email
  it('connects a disconnected channel', async () => {
    const { user } = renderCard()

    await user.click(await screen.findByRole('button', { name: 'Conectar' }))
    await confirmEmail(user, 'Conectar Outlook', '  Tienda@Outlook.com ', 'Conectar')

    expect(api.post).toHaveBeenCalledWith('/channels/connect', {
      channel: 'OUTLOOK',
      accountEmail: 'tienda@outlook.com',
    })
  })

  // Given the Outlook email modal is empty
  // When the admin tries to confirm it
  // Then the channel is not connected
  it('does not connect Outlook without a valid email', async () => {
    const { user } = renderCard()

    await user.click(await screen.findByRole('button', { name: 'Conectar' }))
    const dialog = await screen.findByRole('dialog', { name: 'Conectar Outlook' })
    await user.click(within(dialog).getByRole('button', { name: 'Conectar' }))

    expect(within(dialog).getByText('Obligatorio')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  // Given Gmail is disconnected
  // When the admin types an email and Google sign-in succeeds
  // Then the typed email is the login hint and only the access token is saved
  it('sends the Google access token when connecting Gmail', async () => {
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'GMAIL' ? { ...channel, status: 'DISCONNECTED' } : channel,
      ),
    })
    const { user } = renderCard()

    await user.click(await screen.findByText('Gmail').then(() => connectButton('Gmail')))
    await confirmEmail(user, 'Conectar Gmail', 'Tienda@Gmail.com', 'Continuar')

    expect(googleLogin.hint).toBe('tienda@gmail.com')
    expect(api.post).toHaveBeenCalledWith('/channels/connect', {
      channel: 'GMAIL',
      accessToken: 'google-access-token',
    })
  })

  // Given the typed Gmail address is not the one Google verifies
  // When the connection succeeds
  // Then a quiet notice names the account that was actually connected
  it('warns when Google connects a different email', async () => {
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'GMAIL' ? { ...channel, status: 'DISCONNECTED' } : channel,
      ),
    })
    vi.mocked(api.post).mockResolvedValue({
      connectedChannel: { accountEmail: 'otra@gmail.com' },
    })
    const { user } = renderCard()

    await user.click(await screen.findByText('Gmail').then(() => connectButton('Gmail')))
    await confirmEmail(user, 'Conectar Gmail', 'tienda@gmail.com', 'Continuar')

    expect(
      await screen.findByText('El email escrito no coincide. Se ha conectado otra@gmail.com.'),
    ).toBeInTheDocument()
  })

  // Given Google sign-in is cancelled after the email modal
  // When the admin confirms the email
  // Then nothing is saved and the existing error toast is shown
  it('does not save Gmail when Google sign-in is cancelled', async () => {
    googleLogin.cancel = true
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'GMAIL' ? { ...channel, status: 'DISCONNECTED' } : channel,
      ),
    })
    const { user } = renderCard()

    await user.click(await screen.findByText('Gmail').then(() => connectButton('Gmail')))
    await confirmEmail(user, 'Conectar Gmail', 'tienda@gmail.com', 'Continuar')

    expect(api.post).not.toHaveBeenCalled()
    expect(notifyError).toHaveBeenCalledWith(
      'No se ha podido guardar el cambio. Inténtalo de nuevo.',
    )
  })

  // Given a connected Gmail row whose stored email has capitals and spaces
  // When the card renders
  // Then the label shows that email in lowercase
  it('lowercases the connected account email', async () => {
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'GMAIL'
          ? { ...channel, accountEmail: '  SincraManager@Outlook.es ' }
          : channel,
      ),
    })
    renderCard()

    expect(await screen.findByText('Conectado como sincramanager@outlook.es')).toBeInTheDocument()
  })

  // Given Outlook is connected and has no email
  // When the admin adds one from the row
  // Then that email is saved and no status sentence is shown beforehand
  it('lets a connected channel without an email add one', async () => {
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'OUTLOOK'
          ? { channel: 'OUTLOOK', status: 'CONNECTED', accountEmail: '   ' }
          : channel,
      ),
    })
    const { user } = renderCard()

    const outlookRow = (await screen.findByText('Outlook')).closest(
      'div.justify-between',
    ) as HTMLElement
    expect(within(outlookRow).queryByText('Cuenta conectada')).not.toBeInTheDocument()
    await user.click(within(outlookRow).getByRole('button', { name: 'Añadir email' }))
    await confirmEmail(user, 'Añadir email', 'sincramanager@outlook.es', 'Guardar')

    expect(api.post).toHaveBeenCalledWith('/channels/connect', {
      channel: 'OUTLOOK',
      accountEmail: 'sincramanager@outlook.es',
    })
  })

  // Given Outlook is disconnected but a previous email is still stored
  // When the card renders
  // Then that email is hidden and the connect description stays
  it('keeps the description of a disconnected channel', async () => {
    vi.mocked(api.get).mockResolvedValue({
      channels: mockChannels.map((channel) =>
        channel.channel === 'OUTLOOK' ? { ...channel, accountEmail: 'vieja@outlook.com' } : channel,
      ),
    })
    renderCard()

    expect(await screen.findByText('Conectado como tienda@gmail.com')).toBeInTheDocument()
    expect(screen.queryByText(/vieja@outlook.com/)).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Conecta tu cuenta de Outlook usando OAuth para recibir correos de forma segura.',
      ),
    ).toBeInTheDocument()
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

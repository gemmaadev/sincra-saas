import { useRef, useState } from 'react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { Radio } from 'lucide-react'
import { Spinner, SectionHeader } from '@/shared/components'
import { ChannelConnectionRow } from '@/shared/channels/ChannelConnectionRow'
import { gmailAccountNotice } from '@/shared/channels/gmailAccountNotice'
import { normalizedAccountEmail } from '@/shared/channels/connectedAccountLabel'
import { ChannelAccountEmailModal, type ChannelEmailPurpose } from '@/shared/components'
import { ONBOARDING_CHANNELS } from '@/features/onboarding/onboarding.constants'
import { notifyError } from '@/shared/utils/notify'
import { useConnectedChannels } from '../hooks/useConnectedChannels'
import { useToggleChannelConnection } from '../hooks/useToggleChannelConnection'
import type { ChannelConnectionStatus } from '../types/settings.types'
import type { Channel } from '@/shared/types'

interface ConnectedChannelsCardProps {
  canEdit: boolean
}

interface EmailPrompt {
  channel: Channel
  purpose: ChannelEmailPurpose
  initialEmail: string
}

const STATUS_MAP: Record<ChannelConnectionStatus, 'connected' | 'disconnected' | 'mocked'> = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  MOCKED: 'mocked',
}

const SAVE_ERROR = 'No se ha podido guardar el cambio. Inténtalo de nuevo.'

export function ConnectedChannelsCard(props: ConnectedChannelsCardProps) {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ConnectedChannelsCardContent {...props} />
    </GoogleOAuthProvider>
  )
}

function ConnectedChannelsCardContent({ canEdit }: ConnectedChannelsCardProps) {
  const { data: channels, isLoading } = useConnectedChannels()
  const toggleChannelConnection = useToggleChannelConnection()
  const [prompt, setPrompt] = useState<EmailPrompt | null>(null)
  const [gmailNotice, setGmailNotice] = useState<string | null>(null)
  const typedGmailEmail = useRef<string | null>(null)

  const requestGmailAccess = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: (tokenResponse) => {
      const typed = typedGmailEmail.current
      if (!tokenResponse.access_token) {
        notifyError(SAVE_ERROR)
        return
      }
      toggleChannelConnection.mutate(
        { channel: 'GMAIL', connect: true, accessToken: tokenResponse.access_token },
        {
          onSuccess: (response) => {
            setGmailNotice(
              gmailAccountNotice(typed, response?.connectedChannel?.accountEmail ?? null),
            )
          },
          onError: () => notifyError(SAVE_ERROR),
        },
      )
    },
    onError: () => notifyError(SAVE_ERROR),
    onNonOAuthError: () => notifyError(SAVE_ERROR),
  })

  function statusFor(channel: Channel) {
    const raw = channels?.find((item) => item.channel === channel)?.status ?? 'DISCONNECTED'
    return STATUS_MAP[raw]
  }

  function confirmEmail(email: string) {
    if (!prompt) return
    if (prompt.channel === 'GMAIL') {
      typedGmailEmail.current = email
      setPrompt(null)
      requestGmailAccess({ hint: email })
      return
    }

    toggleChannelConnection.mutate(
      { channel: prompt.channel, connect: true, accountEmail: email },
      {
        onSuccess: () => setPrompt(null),
        onError: () => notifyError(SAVE_ERROR),
      },
    )
  }

  function toggle(channel: Channel, status: 'connected' | 'disconnected' | 'mocked') {
    if (status === 'connected') {
      if (channel === 'GMAIL') setGmailNotice(null)
      toggleChannelConnection.mutate(
        { channel, connect: false },
        { onError: () => notifyError(SAVE_ERROR) },
      )
      return
    }
    setPrompt({ channel, purpose: 'connect', initialEmail: '' })
  }

  const promptChannel = ONBOARDING_CHANNELS.find(
    (channel) => channel.id === prompt?.channel.toLowerCase(),
  )

  return (
    <section
      aria-label="Canales conectados"
      className="flex flex-col gap-4 py-10 first:pt-0 last:pb-0"
    >
      <SectionHeader
        icon={<Radio size={24} aria-hidden="true" />}
        title="Canales conectados"
        description="Canales desde los que recibes y gestionas tus comunicaciones."
      />

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner label="Cargando canales" />
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-100">
          {ONBOARDING_CHANNELS.map((channel) => {
            const backendChannel = channel.id.toUpperCase() as Channel
            const status = statusFor(backendChannel)
            const stored = channels?.find((item) => item.channel === backendChannel)
            const accountEmail =
              status === 'connected' ? normalizedAccountEmail(stored?.accountEmail) : undefined
            const canEditEmail = status === 'connected' && channel.integration === 'real'

            return (
              <ChannelConnectionRow
                key={channel.id}
                channel={channel}
                description={channel.description}
                status={status}
                accountEmail={accountEmail}
                notice={backendChannel === 'GMAIL' ? gmailNotice : null}
                emailAction={
                  canEditEmail
                    ? {
                        label: accountEmail ? 'Cambiar email' : 'Añadir email',
                        onClick: () =>
                          setPrompt({
                            channel: backendChannel,
                            purpose: accountEmail ? 'edit' : 'add',
                            initialEmail: accountEmail ?? '',
                          }),
                      }
                    : undefined
                }
                bordered={false}
                disabled={!canEdit || toggleChannelConnection.isPending}
                onToggle={() => toggle(backendChannel, status)}
              />
            )
          })}
        </div>
      )}

      <ChannelAccountEmailModal
        opened={prompt !== null}
        channelName={promptChannel?.name ?? ''}
        purpose={prompt?.purpose ?? 'connect'}
        asksGoogle={prompt?.channel === 'GMAIL'}
        initialEmail={prompt?.initialEmail ?? ''}
        loading={toggleChannelConnection.isPending && prompt?.channel !== 'GMAIL'}
        onClose={() => setPrompt(null)}
        onConfirm={confirmEmail}
      />
    </section>
  )
}

import { useRef, useState } from 'react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { SincraButton } from '@/shared/components/button'
import { ONBOARDING_CHANNELS } from '../onboarding.constants'
import type { OnboardingChannel } from '../onboarding.types'
import type { ChannelId } from '@/shared/channels/channels'
import { ChannelConnectionRow } from '@/shared/channels/ChannelConnectionRow'
import { normalizedAccountEmail } from '@/shared/channels/connectedAccountLabel'
import {
  ChannelAccountEmailModal,
  type ChannelEmailPurpose,
} from '@/shared/channels/ChannelAccountEmailModal'
import { useConnectedChannels } from '@/features/settings/hooks/useConnectedChannels'
import {
  useToggleChannelConnection,
  type ConnectedChannelResponse,
} from '../hooks/useToggleChannelConnection'
import { notifyError } from '@/shared/utils/notify'

interface ChannelsStepProps {
  connectedChannels: ChannelId[]
  onChange: (connectedChannels: ChannelId[]) => void
  onBack: () => void
  onNext: () => void
}

// WhatsApp/Instagram/Messenger always report MOCKED regardless of what's stored, so skip persisting them
const PERSISTABLE_CHANNELS: ChannelId[] = ['gmail', 'outlook']
const SAVE_ERROR = 'No se ha podido guardar el cambio. Inténtalo de nuevo.'

interface EmailPrompt {
  channelId: ChannelId
  purpose: ChannelEmailPurpose
  initialEmail: string
}

function savedAccountEmail(response: ConnectedChannelResponse | undefined) {
  const email = response?.connectedChannel?.accountEmail
  return typeof email === 'string' ? email.trim().toLowerCase() : null
}

export function ChannelsStep(props: ChannelsStepProps) {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ChannelsStepContent {...props} />
    </GoogleOAuthProvider>
  )
}

function ChannelsStepContent({ connectedChannels, onChange, onBack, onNext }: ChannelsStepProps) {
  // TODO: para Outlook, sustituir este email por el flujo OAuth real cuando el backend esté listo.
  const { data: channels } = useConnectedChannels()
  const toggleChannelConnection = useToggleChannelConnection()
  const [prompt, setPrompt] = useState<EmailPrompt | null>(null)
  const [gmailNotice, setGmailNotice] = useState<string | null>(null)
  const typedGmailEmail = useRef<string | null>(null)

  function accountEmailFor(channel: OnboardingChannel) {
    if (!connectedChannels.includes(channel.id) || channel.integration !== 'real') return undefined
    const stored = channels?.find((item) => item.channel.toLowerCase() === channel.id)
    if (stored?.status !== 'CONNECTED') return null
    return normalizedAccountEmail(stored.accountEmail)
  }

  function connectPersisted(
    channelId: ChannelId,
    previous: ChannelId[],
    input: { accessToken?: string; accountEmail?: string },
    onSaved?: (response: ConnectedChannelResponse) => void,
  ) {
    onChange(previous.includes(channelId) ? previous : [...previous, channelId])
    toggleChannelConnection.mutate(
      { channel: channelId, connect: true, ...input },
      {
        onSuccess: (response) => onSaved?.(response),
        onError: () => {
          onChange(previous)
          notifyError(SAVE_ERROR)
        },
      },
    )
  }

  const requestGmailAccess = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: (tokenResponse) => {
      const typed = typedGmailEmail.current
      const accessToken = tokenResponse.access_token
      if (!accessToken) {
        notifyError(SAVE_ERROR)
        return
      }
      connectPersisted('gmail', connectedChannels, { accessToken }, (response) => {
        const saved = savedAccountEmail(response)
        setGmailNotice(
          typed && saved && typed !== saved
            ? `El email escrito no coincide. Se ha conectado ${saved}.`
            : null,
        )
      })
    },
    onError: () => notifyError(SAVE_ERROR),
    onNonOAuthError: () => notifyError(SAVE_ERROR),
  })

  function confirmEmail(email: string) {
    if (!prompt) return
    if (prompt.channelId === 'gmail') {
      typedGmailEmail.current = email
      setPrompt(null)
      requestGmailAccess({ hint: email })
      return
    }

    const previous = connectedChannels
    setPrompt(null)
    connectPersisted(prompt.channelId, previous, { accountEmail: email })
  }

  const toggleConnection = (channelId: ChannelId) => {
    const isConnected = connectedChannels.includes(channelId)
    if (!isConnected && PERSISTABLE_CHANNELS.includes(channelId)) {
      setPrompt({ channelId, purpose: 'connect', initialEmail: '' })
      return
    }

    if (isConnected && channelId === 'gmail') setGmailNotice(null)

    onChange(
      isConnected
        ? connectedChannels.filter((id) => id !== channelId)
        : [...connectedChannels, channelId],
    )

    if (PERSISTABLE_CHANNELS.includes(channelId)) {
      toggleChannelConnection.mutate(
        { channel: channelId, connect: !isConnected },
        {
          onError: () => {
            onChange(connectedChannels)
            notifyError(SAVE_ERROR)
          },
        },
      )
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Conecta tus canales</h1>
        <p className="text-ink-muted">
          Integra tus cuentas para recibir y gestionar todas tus comunicaciones en un solo lugar.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ONBOARDING_CHANNELS.map((channel) => {
          const isConnected = connectedChannels.includes(channel.id)
          const accountEmail = accountEmailFor(channel)
          const canEditEmail = isConnected && channel.integration === 'real'

          return (
            <ChannelConnectionRow
              key={channel.id}
              channel={channel}
              description={channel.description}
              status={isConnected ? 'connected' : 'disconnected'}
              accountEmail={accountEmail}
              notice={channel.id === 'gmail' ? gmailNotice : null}
              emailAction={
                canEditEmail
                  ? {
                      label: accountEmail ? 'Cambiar email' : 'Añadir email',
                      onClick: () =>
                        setPrompt({
                          channelId: channel.id,
                          purpose: accountEmail ? 'edit' : 'add',
                          initialEmail: accountEmail ?? '',
                        }),
                    }
                  : undefined
              }
              onToggle={() => toggleConnection(channel.id)}
            />
          )
        })}
      </div>

      <ChannelAccountEmailModal
        opened={prompt !== null}
        channelName={
          ONBOARDING_CHANNELS.find((channel) => channel.id === prompt?.channelId)?.name ?? ''
        }
        purpose={prompt?.purpose ?? 'connect'}
        asksGoogle={prompt?.channelId === 'gmail'}
        initialEmail={prompt?.initialEmail ?? ''}
        loading={toggleChannelConnection.isPending && prompt?.channelId !== 'gmail'}
        onClose={() => setPrompt(null)}
        onConfirm={confirmEmail}
      />

      <div className="flex justify-between pt-2">
        <SincraButton variant="secondary" onClick={onBack}>
          ← Volver
        </SincraButton>
        <SincraButton variant="primary" onClick={onNext}>
          Siguiente →
        </SincraButton>
      </div>
    </div>
  )
}

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { Radio } from 'lucide-react'
import { Spinner, SectionHeader } from '@/shared/components'
import { ChannelConnectionRow } from '@/shared/channels/ChannelConnectionRow'
import { ONBOARDING_CHANNELS } from '@/features/onboarding/onboarding.constants'
import { notifyError } from '@/shared/utils/notify'
import { useConnectedChannels } from '../hooks/useConnectedChannels'
import { useToggleChannelConnection } from '../hooks/useToggleChannelConnection'
import type { ChannelConnectionStatus } from '../types/settings.types'
import type { Channel } from '@/shared/types'

interface ConnectedChannelsCardProps {
  canEdit: boolean
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

  const requestGmailAccess = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: (tokenResponse) => {
      if (!tokenResponse.access_token) {
        notifyError(SAVE_ERROR)
        return
      }
      toggleChannelConnection.mutate(
        { channel: 'GMAIL', connect: true, accessToken: tokenResponse.access_token },
        { onError: () => notifyError(SAVE_ERROR) },
      )
    },
    onError: () => notifyError(SAVE_ERROR),
    onNonOAuthError: () => notifyError(SAVE_ERROR),
  })

  function statusFor(channel: Channel) {
    const raw = channels?.find((item) => item.channel === channel)?.status ?? 'DISCONNECTED'
    return STATUS_MAP[raw]
  }

  function toggle(channel: Channel, status: 'connected' | 'disconnected' | 'mocked') {
    const connect = status !== 'connected'
    if (channel === 'GMAIL' && connect) {
      requestGmailAccess()
      return
    }
    toggleChannelConnection.mutate({ channel, connect })
  }

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

            return (
              <ChannelConnectionRow
                key={channel.id}
                channel={channel}
                description={channel.description}
                status={status}
                bordered={false}
                disabled={!canEdit || toggleChannelConnection.isPending}
                onToggle={() => toggle(backendChannel, status)}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

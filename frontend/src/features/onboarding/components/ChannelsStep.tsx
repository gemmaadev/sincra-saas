import { SincraButton } from '@/shared/components/button'
import { ONBOARDING_CHANNELS } from '../onboarding.constants'
import type { ChannelId } from '@/shared/channels/channels'
import { ChannelConnectionRow } from '@/shared/channels/ChannelConnectionRow'
import { useToggleChannelConnection } from '../hooks/useToggleChannelConnection'
import { notifyError } from '@/shared/utils/notify'

interface ChannelsStepProps {
  connectedChannels: ChannelId[]
  onChange: (connectedChannels: ChannelId[]) => void
  onBack: () => void
  onNext: () => void
}

// WhatsApp/Instagram/Messenger always report MOCKED regardless of what's stored, so skip persisting them
const PERSISTABLE_CHANNELS: ChannelId[] = ['gmail', 'outlook']

export function ChannelsStep({ connectedChannels, onChange, onBack, onNext }: ChannelsStepProps) {
  // TODO: para Gmail/Outlook, sustituir por el flujo OAuth real cuando el backend esté listo.
  const toggleChannelConnection = useToggleChannelConnection()

  const toggleConnection = (channelId: ChannelId) => {
    const isConnected = connectedChannels.includes(channelId)
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
            notifyError('No se ha podido guardar el cambio. Inténtalo de nuevo.')
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
        {ONBOARDING_CHANNELS.map((channel) => (
          <ChannelConnectionRow
            key={channel.id}
            channel={channel}
            description={channel.description}
            status={connectedChannels.includes(channel.id) ? 'connected' : 'disconnected'}
            onToggle={() => toggleConnection(channel.id)}
          />
        ))}
      </div>

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

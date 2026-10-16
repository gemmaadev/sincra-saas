import { Radio } from 'lucide-react'
import { Card } from '@/shared/components'
import { ChannelConnectionRow } from '@/shared/channels/ChannelConnectionRow'
import { ONBOARDING_CHANNELS } from '@/features/onboarding/onboarding.constants'
import { useConnectedChannels } from '../hooks/useConnectedChannels'
import { useToggleChannelConnection } from '../hooks/useToggleChannelConnection'
import { SectionHeader } from './SectionHeader'
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

export function ConnectedChannelsCard({ canEdit }: ConnectedChannelsCardProps) {
  const { data: channels, isLoading } = useConnectedChannels()
  const toggleChannelConnection = useToggleChannelConnection()

  function statusFor(channel: Channel) {
    const raw = channels?.find((item) => item.channel === channel)?.status ?? 'DISCONNECTED'
    return STATUS_MAP[raw]
  }

  return (
    <Card className="flex flex-col gap-4">
      <SectionHeader
        icon={<Radio size={24} aria-hidden="true" />}
        title="Canales conectados"
        description="Canales desde los que recibes y gestionas tus comunicaciones."
      />

      {isLoading ? (
        <p className="text-sm text-ink-muted">Cargando canales...</p>
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
                onToggle={() =>
                  toggleChannelConnection.mutate({
                    channel: backendChannel,
                    connect: status !== 'connected',
                  })
                }
              />
            )
          })}
        </div>
      )}
    </Card>
  )
}

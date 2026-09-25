import { SincraButton } from '@/shared/components/button'
import { ONBOARDING_CHANNELS } from '../onboarding.constants'
import type { OnboardingChannel } from '../onboarding.types'
import type { ChannelId } from '@/shared/channels/channels'
import { Check } from 'lucide-react'

interface ChannelsStepProps {
  connectedChannels: ChannelId[]
  onChange: (connectedChannels: ChannelId[]) => void
  onBack: () => void
  onNext: () => void
}

export function ChannelsStep({ connectedChannels, onChange, onBack, onNext }: ChannelsStepProps) {
  // TODO: para Gmail/Outlook, sustituir por el flujo OAuth real cuando el backend esté listo.
  const toggleConnection = (channelId: ChannelId) => {
    const isConnected = connectedChannels.includes(channelId)
    onChange(
      isConnected
        ? connectedChannels.filter((id) => id !== channelId)
        : [...connectedChannels, channelId],
    )
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
          <ChannelCard
            key={channel.id}
            channel={channel}
            isConnected={connectedChannels.includes(channel.id)}
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

interface ChannelCardProps {
  channel: OnboardingChannel
  isConnected: boolean
  onToggle: () => void
}

function ChannelCard({ channel, isConnected, onToggle }: ChannelCardProps) {
  const Icon = channel.icon

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-100 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
          <Icon size={22} className={channel.colorClassName} />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-ink">{channel.name}</span>
          <p className="text-sm text-ink-muted">{channel.description}</p>
        </div>
      </div>

      {isConnected ? (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isConnected}
          aria-label={`Desconectar ${channel.name}`}
          className="shrink-0 rounded-full p-1 text-success transition-colors hover:bg-success/10"
        >
          <Check size={26} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isConnected}
          className="shrink-0 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          Conectar
        </button>
      )}
    </div>
  )
}

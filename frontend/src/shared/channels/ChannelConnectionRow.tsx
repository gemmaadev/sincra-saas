import { Check } from 'lucide-react'
import type { ChannelBrand } from './channels'

interface ChannelConnectionRowProps {
  channel: ChannelBrand
  description: string
  status: 'connected' | 'disconnected' | 'mocked'
  disabled?: boolean
  bordered?: boolean
  onToggle?: () => void
}

export function ChannelConnectionRow({
  channel,
  description,
  status,
  disabled = false,
  bordered = true,
  onToggle,
}: ChannelConnectionRowProps) {
  const Icon = channel.icon
  const isMocked = status === 'mocked'

  return (
    <div
      className={`flex items-center justify-between gap-2 ${
        bordered ? 'rounded-xl border border-neutral-100 p-4' : 'py-3 first:pt-0 last:pb-0'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
          <Icon size={22} className={channel.colorClassName} />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-ink">{channel.name}</span>
          <p className="text-sm text-ink-muted">{description}</p>
        </div>
      </div>

      {status === 'connected' ? (
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed
          aria-label={`Desconectar ${channel.name}`}
          className="shrink-0 rounded-full p-1 text-success transition-colors enabled:hover:bg-success/10 disabled:opacity-50"
        >
          <Check size={26} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled || isMocked}
          aria-pressed={false}
          aria-label={isMocked ? `Conectar ${channel.name} (no disponible)` : undefined}
          className="shrink-0 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary transition-colors enabled:hover:bg-primary/5 disabled:opacity-50"
        >
          Conectar
        </button>
      )}
    </div>
  )
}

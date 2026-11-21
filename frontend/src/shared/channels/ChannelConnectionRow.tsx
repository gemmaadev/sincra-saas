import { Check } from 'lucide-react'
import { SincraButton } from '@/shared/components/button'
import type { ChannelBrand } from './channels'
import { connectedAccountLabel } from './connectedAccountLabel'

interface ChannelConnectionRowProps {
  channel: ChannelBrand
  description: string
  status: 'connected' | 'disconnected' | 'mocked'
  accountEmail?: string | null
  emailAction?: { label: string; onClick: () => void }
  notice?: string | null
  disabled?: boolean
  bordered?: boolean
  onToggle?: () => void
}

export function ChannelConnectionRow({
  channel,
  description,
  status,
  accountEmail,
  emailAction,
  notice,
  disabled = false,
  bordered = true,
  onToggle,
}: ChannelConnectionRowProps) {
  const Icon = channel.icon
  const isMocked = status === 'mocked'
  const accountLabel =
    status === 'connected' && accountEmail !== undefined
      ? connectedAccountLabel(accountEmail)
      : undefined
  const detail = accountLabel === undefined ? description : accountLabel
  const breakEmail = Boolean(accountLabel)

  return (
    <div
      className={`flex items-center justify-between gap-2 ${
        bordered ? 'rounded-xl border border-neutral-100 p-4' : 'py-3 first:pt-0 last:pb-0'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
          <Icon size={22} className={channel.colorClassName} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-semibold text-ink">{channel.name}</span>
          {detail && (
            <p className={`text-sm text-ink-muted ${breakEmail ? 'break-all' : ''}`}>{detail}</p>
          )}
          {notice && <p className="text-xs text-ink-muted">{notice}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {emailAction && (
          <SincraButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={emailAction.onClick}
            disabled={disabled}
          >
            {emailAction.label}
          </SincraButton>
        )}
        {status === 'connected' ? (
          <SincraButton
            type="button"
            variant="ghost"
            onClick={onToggle}
            disabled={disabled}
            aria-pressed
            aria-label={`Desconectar ${channel.name}`}
            className="!rounded-full !p-1 text-success transition-colors enabled:hover:bg-success/10 disabled:opacity-50"
          >
            <Check size={26} />
          </SincraButton>
        ) : (
          <SincraButton
            type="button"
            variant="secondary"
            onClick={onToggle}
            disabled={disabled || isMocked}
            aria-pressed={false}
            aria-label={isMocked ? `Conectar ${channel.name} (no disponible)` : undefined}
            className="shrink-0 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary transition-colors enabled:hover:bg-primary/5 disabled:opacity-50"
          >
            Conectar
          </SincraButton>
        )}
      </div>
    </div>
  )
}

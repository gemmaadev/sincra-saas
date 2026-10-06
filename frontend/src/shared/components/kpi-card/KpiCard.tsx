import { Tooltip } from '@mantine/core'
import { Info, type LucideIcon } from 'lucide-react'
import { Card } from '@/shared/components'

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string
  pending?: boolean
  infoTooltip?: string
}

export function KpiCard({ icon: Icon, label, value, pending = false, infoTooltip }: KpiCardProps) {
  return (
    <Card padding="sm" className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg text-primary">
        <Icon size={26} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-1">
          <p className="text-sm text-ink-muted">{label}</p>
          {infoTooltip && (
            <Tooltip label={infoTooltip} withArrow position="top">
              <Info size={13} className="text-ink-muted" aria-hidden="true" />
            </Tooltip>
          )}
        </div>
        <p
          className={`truncate text-2xl font-semibold ${pending ? 'text-ink-muted' : 'text-ink'}`}
          title={pending ? 'Disponible cuando exista el módulo de pedidos/estadísticas' : value}
        >
          {value}
        </p>
      </div>
    </Card>
  )
}

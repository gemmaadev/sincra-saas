import type { LucideIcon } from 'lucide-react'
import { Card, InfoTooltip, NoPriceDataHint, Skeleton } from '@/shared/components'

export interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string
  pending?: boolean
  infoTooltip?: string
  noPriceData?: boolean
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  pending = false,
  infoTooltip,
  noPriceData = false,
}: KpiCardProps) {
  return (
    <Card padding="sm" className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg text-primary">
        <Icon size={26} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-1">
          <p className="text-sm text-ink-muted">{label}</p>
          {infoTooltip && <InfoTooltip label={infoTooltip} />}
        </div>
        {pending ? (
          <Skeleton className="h-5 w-16" />
        ) : (
          <div className="flex items-center gap-1">
            <p className="truncate text-2xl font-semibold text-ink">{value}</p>
            {noPriceData && <NoPriceDataHint />}
          </div>
        )}
      </div>
    </Card>
  )
}

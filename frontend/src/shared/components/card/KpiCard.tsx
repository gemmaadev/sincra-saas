import type { LucideIcon } from 'lucide-react'
import { Card, InfoTooltip, Skeleton } from '@/shared/components'
import { MissingPrice } from '../tooltip/MissingPrice'
import { missingPricesLabel } from '../tooltip/missingPricesLabel'
import { NoPriceDataHint } from '../tooltip/NoPriceDataHint'

export interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string
  pending?: boolean
  infoTooltip?: string
  noPriceData?: boolean
  missingPriceCount?: number
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  pending = false,
  infoTooltip,
  noPriceData = false,
  missingPriceCount = 0,
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
            {noPriceData ? (
              <NoPriceDataHint />
            ) : (
              missingPriceCount > 0 && (
                <MissingPrice label={missingPricesLabel(missingPriceCount)} />
              )
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

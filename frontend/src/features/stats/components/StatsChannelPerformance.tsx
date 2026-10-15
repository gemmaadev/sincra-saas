import { Card, InfoTooltip } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { ChannelPerformanceRow } from '../utils/buildChannelPerformanceRows'

interface StatsChannelPerformanceProps {
  rows: ChannelPerformanceRow[]
}

export function StatsChannelPerformance({ rows }: StatsChannelPerformanceProps) {
  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-center gap-1">
        <h2 className="font-semibold text-ink">Rendimiento por canal</h2>
        <InfoTooltip label="Ingresos y ticket medio por canal, calculados solo sobre pedidos entregados." />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Todavía no hay pedidos entregados en este periodo.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const Icon = row.icon

            return (
              <li key={row.label} className="flex items-center gap-3">
                <Icon size={18} className={`shrink-0 ${row.colorClassName}`} aria-hidden="true" />
                <span className="w-24 shrink-0 truncate text-sm text-ink">{row.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-sm text-ink-muted">
                  {formatCurrency(row.revenue)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

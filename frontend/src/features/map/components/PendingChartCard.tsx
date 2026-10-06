import { Card } from '@/shared/components'

const PLACEHOLDER_BAR_HEIGHTS = [60, 85, 40, 70, 50]

interface PendingChartCardProps {
  title: string
}

export function PendingChartCard({ title }: PendingChartCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-semibold text-ink">{title}</h2>

      <div className="flex h-32 items-end gap-3" aria-hidden="true">
        {PLACEHOLDER_BAR_HEIGHTS.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-md bg-neutral-100"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <p className="text-sm text-ink-muted">Disponible cuando exista el módulo de pedidos.</p>
    </Card>
  )
}

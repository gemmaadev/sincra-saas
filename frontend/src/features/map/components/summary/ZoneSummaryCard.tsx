import { Card } from '@/shared/components'
import type { ZoneSummary } from '../../types/map.types'

const MAX_ZONES_SHOWN = 5

interface ZoneSummaryCardProps {
  zones: ZoneSummary[]
  onSelectZone: (zone: string) => void
}

export function ZoneSummaryCard({ zones, onSelectZone }: ZoneSummaryCardProps) {
  const shownZones = zones.slice(0, MAX_ZONES_SHOWN)
  const hiddenZonesCount = zones.length - shownZones.length

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-semibold text-ink">Resumen por zonas</h2>

      {zones.length === 0 && <p className="text-sm text-ink-muted">Todavía no hay clientes.</p>}

      <ul className="flex flex-col gap-3">
        {shownZones.map(({ zone, count, percentage }) => (
          <li key={zone}>
            <button
              type="button"
              onClick={() => onSelectZone(zone)}
              title="Ver esta zona en el mapa"
              className="flex w-full cursor-pointer flex-col gap-1 rounded-lg p-1 text-left hover:bg-neutral-50"
            >
              <div className="flex w-full items-center justify-between gap-2 text-sm">
                <span className="truncate text-ink">{zone}</span>
                <span className="shrink-0 text-ink-muted">
                  {count} clientes - {percentage} %
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-100" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {hiddenZonesCount > 0 && (
        <p className="text-sm text-ink-muted">
          y {hiddenZonesCount} {hiddenZonesCount === 1 ? 'zona más' : 'zonas más'}
        </p>
      )}
    </Card>
  )
}

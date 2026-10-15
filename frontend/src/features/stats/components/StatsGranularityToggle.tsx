import type { OrdersEvolutionGranularity } from '../types/stats.types'

const OPTIONS: { value: OrdersEvolutionGranularity; label: string }[] = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
]

interface StatsGranularityToggleProps {
  granularity: OrdersEvolutionGranularity
  onGranularityChange: (value: OrdersEvolutionGranularity) => void
}

export function StatsGranularityToggle({
  granularity,
  onGranularityChange,
}: StatsGranularityToggleProps) {
  return (
    <div
      role="group"
      aria-label="Agrupar evolución por"
      className="inline-flex overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md"
    >
      {OPTIONS.map(({ value, label }) => {
        const isActive = value === granularity

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onGranularityChange(value)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              isActive ? 'bg-primary text-white' : 'text-ink-muted hover:bg-neutral-50'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

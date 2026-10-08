import type { MapLayer } from '../types/map.types'

const baseClasses = 'px-4 py-1.5 text-sm font-medium transition-colors'

const LAYERS: { value: MapLayer; label: string }[] = [
  { value: 'clients', label: 'Clientes' },
  { value: 'orders', label: 'Pedidos' },
]

interface MapLayerToggleProps {
  layer: MapLayer
  onLayerChange: (layer: MapLayer) => void
}

export function MapLayerToggle({ layer, onLayerChange }: MapLayerToggleProps) {
  return (
    <div
      role="group"
      aria-label="Capa del mapa"
      className="inline-flex overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md"
    >
      {LAYERS.map(({ value, label }) => {
        const isActive = value === layer

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onLayerChange(value)}
            className={`${baseClasses} ${isActive ? 'bg-primary text-white' : 'text-ink-muted hover:bg-neutral-50'}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

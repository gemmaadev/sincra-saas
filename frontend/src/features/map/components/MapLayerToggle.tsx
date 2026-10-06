const baseClasses = 'px-4 py-1.5 text-sm font-medium transition-colors'

export function MapLayerToggle() {
  return (
    <div
      role="group"
      aria-label="Capa del mapa"
      className="inline-flex overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md"
    >
      <button type="button" aria-pressed="true" className={`${baseClasses} bg-primary text-white`}>
        Clientes
      </button>
      {['Pedidos', 'Ambos'].map((layerName) => (
        <button
          key={layerName}
          type="button"
          disabled
          className={`${baseClasses} cursor-not-allowed text-neutral-400`}
        >
          {layerName}
        </button>
      ))}
    </div>
  )
}

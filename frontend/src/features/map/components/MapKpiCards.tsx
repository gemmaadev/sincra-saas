import { Layers, MapPin, MapPinOff, Trophy } from 'lucide-react'
import { KpiCard } from '@/shared/components'
import type { MapKpis } from '../utils/buildMapKpis'

interface MapKpiCardsProps {
  kpis: MapKpis
}

export function MapKpiCards({ kpis }: MapKpiCardsProps) {
  const { clientsOnMap, activeZones, topZone, approximateClients } = kpis

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiCard icon={MapPin} label="Clientes en el mapa" value={String(clientsOnMap)} />
      <KpiCard icon={Layers} label="Zonas activas" value={String(activeZones)} />
      <KpiCard icon={Trophy} label="Zona principal" value={topZone ?? '—'} />
      <KpiCard
        icon={MapPinOff}
        label="Sin ubicación exacta"
        value={String(approximateClients)}
        infoTooltip="Clientes sin dirección o que no se han podido ubicar"
      />
    </div>
  )
}

import { Layers, MapPin, MapPinOff, Trophy } from 'lucide-react'
import type { KpiCardProps } from '@/shared/components'
import type { ClientMapResponse } from '../types/map.types'

export interface ClientMapKpis {
  clientsOnMap: number
  activeZones: number
  topZone: string | null
  approximateClients: number
}

export function buildClientMapKpis({ clients, zones }: ClientMapResponse): ClientMapKpis {
  const realZones = zones.filter((zone) => zone.zone !== 'Sin zona')
  const [topZone] = realZones

  return {
    clientsOnMap: clients.length,
    activeZones: realZones.length,
    topZone: topZone?.zone ?? null,
    approximateClients: clients.filter((client) => client.approximate).length,
  }
}

export function toClientKpiCards(kpis: ClientMapKpis | null): KpiCardProps[] {
  if (!kpis) {
    return [
      { icon: MapPin, label: 'Clientes en el mapa', value: '', pending: true },
      { icon: Layers, label: 'Zonas activas', value: '', pending: true },
      { icon: Trophy, label: 'Zona principal', value: '', pending: true },
      { icon: MapPinOff, label: 'Sin ubicación exacta', value: '', pending: true },
    ]
  }

  return [
    { icon: MapPin, label: 'Clientes en el mapa', value: String(kpis.clientsOnMap) },
    { icon: Layers, label: 'Zonas activas', value: String(kpis.activeZones) },
    { icon: Trophy, label: 'Zona principal', value: kpis.topZone ?? '—' },
    {
      icon: MapPinOff,
      label: 'Sin ubicación exacta',
      value: String(kpis.approximateClients),
      infoTooltip: 'Clientes sin dirección o que no se han podido ubicar',
    },
  ]
}

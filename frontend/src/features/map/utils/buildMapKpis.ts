import type { ClientMapResponse } from '../types/map.types'

export interface MapKpis {
  clientsOnMap: number
  activeZones: number
  topZone: { name: string; percentage: number } | null
  approximateClients: number
}

export function buildMapKpis({ clients, zones }: ClientMapResponse): MapKpis {
  const realZones = zones.filter((zone) => zone.zone !== 'Sin zona')
  const [topZone] = realZones

  return {
    clientsOnMap: clients.length,
    activeZones: realZones.length,
    topZone: topZone ? { name: topZone.zone, percentage: topZone.percentage } : null,
    approximateClients: clients.filter((client) => client.approximate).length,
  }
}

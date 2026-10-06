import type { ClientMapResponse } from '../types/map.types'

export interface MapKpis {
  clientsOnMap: number
  activeZones: number
  topZone: string | null
  approximateClients: number
}

export function buildMapKpis({ clients, zones }: ClientMapResponse): MapKpis {
  const realZones = zones.filter((zone) => zone.zone !== 'Sin zona')
  const [topZone] = realZones

  return {
    clientsOnMap: clients.length,
    activeZones: realZones.length,
    topZone: topZone?.zone ?? null,
    approximateClients: clients.filter((client) => client.approximate).length,
  }
}

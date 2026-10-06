import type { LatLngTuple } from 'leaflet'
import type { MapClient } from '../types/map.types'

export function getZonePositions(clients: MapClient[], zone: string): LatLngTuple[] {
  return clients
    .filter((client) => (client.zone?.trim() || 'Sin zona') === zone)
    .map((client): LatLngTuple => [client.latitude, client.longitude])
}

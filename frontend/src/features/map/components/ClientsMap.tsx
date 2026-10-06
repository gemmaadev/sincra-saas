import { MapContainer, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import type { FitBoundsOptions, LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import './clients-map.css'
import { ClientMarker } from './ClientMarker'
import { createClusterIcon } from '../utils/createClusterIcon'
import type { MapClient } from '../types/map.types'

const DEFAULT_CENTER: LatLngTuple = [41.6, 1.9]
const DEFAULT_ZOOM = 8
const FIT_ALL_CLIENTS_OPTIONS: FitBoundsOptions = { maxZoom: 13, padding: [40, 40] }
const TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILES_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

interface ClientsMapProps {
  clients: MapClient[]
  onEditClient: (client: MapClient) => void
  onDeleteClient: (client: MapClient) => void
}

export function ClientsMap({ clients, onEditClient, onDeleteClient }: ClientsMapProps) {
  const clientPositions = clients.map((client): LatLngTuple => [client.latitude, client.longitude])
  const areaToShow = clientPositions.length > 0 ? clientPositions : undefined

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      bounds={areaToShow}
      boundsOptions={FIT_ALL_CLIENTS_OPTIONS}
      className="isolate h-128 w-full rounded-card"
    >
      <TileLayer url={TILES_URL} attribution={TILES_ATTRIBUTION} />
      <MarkerClusterGroup
        iconCreateFunction={createClusterIcon}
        showCoverageOnHover={false}
        maxClusterRadius={50}
        chunkedLoading
      >
        {clients.map((client) => (
          <ClientMarker
            key={client.id}
            client={client}
            onEdit={onEditClient}
            onDelete={onDeleteClient}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

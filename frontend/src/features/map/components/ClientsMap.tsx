import { MapContainer, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import type { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import '../styles/clients-map.css'
import { ClientMarker } from './ClientMarker'
import { LayerFocus } from './LayerFocus'
import { MapFocus } from './MapFocus'
import { NewClientPin } from './NewClientPin'
import { NewOrderPin } from './NewOrderPin'
import { OrderMarker } from './OrderMarker'
import { createClusterIcon } from '../utils/createClusterIcon'
import type { Coordinates } from '@/features/clients/types/client.types'
import type { MapClient, MapLayer, MapOrder } from '../types/map.types'

const DEFAULT_CENTER: LatLngTuple = [41.6, 1.9]
const DEFAULT_ZOOM = 8
const TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILES_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

interface ClientsMapProps {
  layer: MapLayer
  clients: MapClient[]
  orders: MapOrder[]
  focusedPositions: LatLngTuple[] | null
  onEditClient: (client: MapClient) => void
  onDeleteClient: (client: MapClient) => void
  onCreateClientAt: (location: Coordinates) => void
  onEditOrder: (order: MapOrder) => void
  onCancelOrder: (order: MapOrder) => void
  onDeleteOrder: (order: MapOrder) => void
  onCreateOrderAt: (location: Coordinates) => void
}

export function ClientsMap({
  layer,
  clients,
  orders,
  focusedPositions,
  onEditClient,
  onDeleteClient,
  onCreateClientAt,
  onEditOrder,
  onCancelOrder,
  onDeleteOrder,
  onCreateOrderAt,
}: ClientsMapProps) {
  const clientPositions = clients.map((client): LatLngTuple => [client.latitude, client.longitude])
  const orderPositions = orders.map((order): LatLngTuple => [order.latitude, order.longitude])
  const activePositions = layer === 'clients' ? clientPositions : orderPositions
  const areaToShow = activePositions.length > 0 ? activePositions : undefined

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      bounds={areaToShow}
      boundsOptions={{ maxZoom: 13, padding: [40, 40] }}
      className="isolate h-full w-full rounded-card"
    >
      <TileLayer url={TILES_URL} attribution={TILES_ATTRIBUTION} />
      <MapFocus positions={focusedPositions} />
      <LayerFocus layer={layer} positions={activePositions} />
      {layer === 'clients' ? (
        <NewClientPin onCreate={onCreateClientAt} />
      ) : (
        <NewOrderPin onCreate={onCreateOrderAt} />
      )}
      <MarkerClusterGroup
        key={layer}
        iconCreateFunction={(cluster) =>
          createClusterIcon(cluster, layer === 'clients' ? 'bg-primary' : 'bg-primary-dark')
        }
        showCoverageOnHover={false}
        maxClusterRadius={50}
        chunkedLoading
      >
        {layer === 'clients'
          ? clients.map((client) => (
              <ClientMarker
                key={client.id}
                client={client}
                onEdit={onEditClient}
                onDelete={onDeleteClient}
              />
            ))
          : orders.map((order) => (
              <OrderMarker
                key={order.id}
                order={order}
                onEdit={onEditOrder}
                onCancel={onCancelOrder}
                onDelete={onDeleteOrder}
              />
            ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

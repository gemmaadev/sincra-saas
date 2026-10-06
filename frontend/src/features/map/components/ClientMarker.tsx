import { renderToStaticMarkup } from 'react-dom/server'
import { divIcon } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { UserRound } from 'lucide-react'
import { ClientPopupCard } from './ClientPopupCard'
import type { MapClient } from '../types/map.types'

const CLIENT_ICON = divIcon({
  className: 'client-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  html: renderToStaticMarkup(
    <div className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-primary text-white shadow-md">
      <UserRound size={16} aria-hidden="true" />
    </div>,
  ),
})

interface ClientMarkerProps {
  client: MapClient
}

export function ClientMarker({ client }: ClientMarkerProps) {
  return (
    <Marker position={[client.latitude, client.longitude]} icon={CLIENT_ICON} title={client.name}>
      <Popup minWidth={240}>
        <ClientPopupCard client={client} />
      </Popup>
    </Marker>
  )
}

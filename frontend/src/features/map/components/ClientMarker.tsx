import { renderToStaticMarkup } from 'react-dom/server'
import { divIcon } from 'leaflet'
import type { DivIcon } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { UserRound } from 'lucide-react'
import type { MapClient } from '../types/map.types'

function createClientIcon(approximate: boolean): DivIcon {
  const variantClasses = approximate
    ? 'border-dashed bg-white text-primary'
    : 'bg-primary text-white'

  return divIcon({
    className: 'client-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    html: renderToStaticMarkup(
      <div
        className={`flex size-8 items-center justify-center rounded-full border-2 border-primary shadow-md ${variantClasses}`}
      >
        <UserRound size={16} aria-hidden="true" />
      </div>,
    ),
  })
}

const EXACT_CLIENT_ICON = createClientIcon(false)
const APPROXIMATE_CLIENT_ICON = createClientIcon(true)

interface ClientMarkerProps {
  client: MapClient
}

export function ClientMarker({ client }: ClientMarkerProps) {
  return (
    <Marker
      position={[client.latitude, client.longitude]}
      icon={client.approximate ? APPROXIMATE_CLIENT_ICON : EXACT_CLIENT_ICON}
      title={client.name}
    >
      <Popup>
        <p className="font-medium">{client.name}</p>
        {client.zone && <p>{client.zone}</p>}
      </Popup>
    </Marker>
  )
}

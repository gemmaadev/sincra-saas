import { renderToStaticMarkup } from 'react-dom/server'
import { divIcon } from 'leaflet'
import { Marker, Popup, useMap } from 'react-leaflet'
import { getInitials } from '@/shared/utils'
import { ClientPopupCard } from './ClientPopupCard'
import type { MapClient } from '../types/map.types'

function buildClientIcon(name: string) {
  return divIcon({
    className: 'client-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    html: renderToStaticMarkup(
      <div className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-primary text-sm font-semibold text-white shadow-md">
        {getInitials(name)}
      </div>,
    ),
  })
}

interface ClientMarkerProps {
  client: MapClient
  onEdit: (client: MapClient) => void
  onDelete: (client: MapClient) => void
}

export function ClientMarker({ client, onEdit, onDelete }: ClientMarkerProps) {
  const map = useMap()

  function runAndClosePopup(action: (client: MapClient) => void) {
    map.closePopup()
    action(client)
  }

  return (
    <Marker
      position={[client.latitude, client.longitude]}
      icon={buildClientIcon(client.name)}
      title={client.name}
    >
      <Popup minWidth={240}>
        <ClientPopupCard
          client={client}
          onEdit={() => runAndClosePopup(onEdit)}
          onDelete={() => runAndClosePopup(onDelete)}
        />
      </Popup>
    </Marker>
  )
}

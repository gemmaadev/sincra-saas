import { useState } from 'react'
import { Popup, useMap, useMapEvents } from 'react-leaflet'
import type { LatLng } from 'leaflet'
import { SincraButton } from '@/shared/components'
import type { Coordinates } from '@/features/clients/types/client.types'

interface NewClientPinProps {
  onCreate: (location: Coordinates) => void
}

function roundCoordinate(value: number): number {
  return Number(value.toFixed(6))
}

export function NewClientPin({ onCreate }: NewClientPinProps) {
  const map = useMap()
  const [position, setPosition] = useState<LatLng | null>(null)

  useMapEvents({ click: (event) => setPosition(event.latlng) })

  if (!position) return null

  return (
    <Popup
      key={`${position.lat},${position.lng}`}
      position={position}
      eventHandlers={{ remove: () => setPosition(null) }}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink">¿Añadir un cliente en este punto?</p>
        <SincraButton
          size="sm"
          onClick={() => {
            map.closePopup()
            onCreate({
              latitude: roundCoordinate(position.lat),
              longitude: roundCoordinate(position.lng),
            })
          }}
        >
          Nuevo cliente aquí
        </SincraButton>
      </div>
    </Popup>
  )
}

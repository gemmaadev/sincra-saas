import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'

interface MapFocusProps {
  positions: LatLngTuple[] | null
}

export function MapFocus({ positions }: MapFocusProps) {
  const map = useMap()

  useEffect(() => {
    if (positions && positions.length > 0) {
      map.fitBounds(positions, { maxZoom: 13, padding: [40, 40] })
    }
  }, [map, positions])

  return null
}

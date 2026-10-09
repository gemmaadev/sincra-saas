import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'
import type { MapLayer } from '../types/map.types'

interface LayerFocusProps {
  layer: MapLayer
  positions: LatLngTuple[]
}

// Refits the map to the active layer's markers whenever the layer itself changes,
// since switching to a layer with markers elsewhere would otherwise leave the viewport
// wherever the previous layer left it.
export function LayerFocus({ layer, positions }: LayerFocusProps) {
  const map = useMap()
  const previousLayer = useRef(layer)

  useEffect(() => {
    if (previousLayer.current === layer) return
    previousLayer.current = layer

    if (positions.length > 0) map.fitBounds(positions, { maxZoom: 13, padding: [40, 40] })
  }, [layer, positions, map])

  return null
}

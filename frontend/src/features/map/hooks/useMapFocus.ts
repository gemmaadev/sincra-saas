import { useEffect, useRef, useState } from 'react'
import type { LatLngTuple } from 'leaflet'
import { getZonePositions } from '../utils/getZonePositions'
import type { MapClient } from '../types/map.types'

export function useMapFocus(
  clients: MapClient[] | undefined,
  filtersKey: string,
  isPlaceholderData: boolean,
) {
  const [focusedPositions, setFocusedPositions] = useState<LatLngTuple[] | null>(null)
  const lastFittedFiltersKey = useRef<string>(filtersKey)

  useEffect(() => {
    if (!clients || isPlaceholderData || lastFittedFiltersKey.current === filtersKey) return

    lastFittedFiltersKey.current = filtersKey
    setFocusedPositions(clients.map((client): LatLngTuple => [client.latitude, client.longitude]))
  }, [clients, filtersKey, isPlaceholderData])

  function focusZone(zone: string) {
    if (clients) setFocusedPositions(getZonePositions(clients, zone))
  }

  return { focusedPositions, focusZone }
}

/// <reference types="leaflet.markercluster" />
import { renderToStaticMarkup } from 'react-dom/server'
import { divIcon } from 'leaflet'
import type { DivIcon, MarkerCluster } from 'leaflet'

// A cluster's colour should match the markers it groups (client vs. order), so the caller
// picks it instead of this always defaulting to the client colour.
export function createClusterIcon(cluster: MarkerCluster, colorClassName: string): DivIcon {
  return divIcon({
    className: 'client-cluster',
    iconSize: [40, 40],
    html: renderToStaticMarkup(
      <div
        className={`flex size-10 items-center justify-center rounded-full border-2 border-white ${colorClassName} text-sm font-semibold text-white shadow-md`}
      >
        {cluster.getChildCount()}
      </div>,
    ),
  })
}

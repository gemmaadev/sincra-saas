/// <reference types="leaflet.markercluster" />
import { renderToStaticMarkup } from 'react-dom/server'
import { divIcon } from 'leaflet'
import type { DivIcon, MarkerCluster } from 'leaflet'

export function createClusterIcon(cluster: MarkerCluster): DivIcon {
  return divIcon({
    className: 'client-cluster',
    iconSize: [40, 40],
    html: renderToStaticMarkup(
      <div className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-primary text-sm font-semibold text-white shadow-md">
        {cluster.getChildCount()}
      </div>,
    ),
  })
}

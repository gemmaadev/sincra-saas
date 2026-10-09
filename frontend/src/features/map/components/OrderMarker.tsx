import { renderToStaticMarkup } from 'react-dom/server'
import { divIcon } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { OrderPopupCard } from './OrderPopupCard'
import type { MapOrder } from '../types/map.types'

function buildOrderIcon(number: number) {
  return divIcon({
    className: 'order-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    html: renderToStaticMarkup(
      <div className="flex size-8 items-center justify-center rounded-full border-2 border-primary-dark bg-primary-dark text-xs font-semibold text-white shadow-md">
        #{number}
      </div>,
    ),
  })
}

interface OrderMarkerProps {
  order: MapOrder
}

export function OrderMarker({ order }: OrderMarkerProps) {
  return (
    <Marker
      position={[order.latitude, order.longitude]}
      icon={buildOrderIcon(order.number)}
      title={`Pedido #${order.number}`}
    >
      <Popup minWidth={240}>
        <OrderPopupCard order={order} />
      </Popup>
    </Marker>
  )
}

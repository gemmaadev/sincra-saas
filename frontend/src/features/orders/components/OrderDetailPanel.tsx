import { Avatar, Tabs } from '@/shared/components'
import { useOrderDetail } from '../hooks/useOrderDetail'
import { OrderSummaryTab } from './OrderSummaryTab'
import { OrderItemsList } from './OrderItemsList'
import { OrderTimeline } from './OrderTimeline'
import { OrderNotesTab } from './OrderNotesTab'
import { OrderTagsTab } from './OrderTagsTab'
import { Mail, Phone } from 'lucide-react'

interface OrderDetailPanelProps {
  id: string
}

export function OrderDetailPanel({ id }: OrderDetailPanelProps) {
  const { data: order, isLoading, isError } = useOrderDetail(id)

  if (isLoading) {
    return <p className="text-ink-muted">Cargando pedido...</p>
  }

  if (isError || !order) {
    return <p className="text-error">No se ha podido cargar el pedido.</p>
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <h2 className="shrink-0 text-lg font-semibold text-ink">Pedido #{order.number}</h2>
      <div className="flex flex-row gap-2 text-xs  w-full">
        <Avatar name={order.client.name} size="xs" roundness="rounded" />
        <div className="flex items-center text-xs  gap-2">
          <span className=" text-ink">{order.client.name} </span>
        </div>
        {order.client.email && (
          <span className="flex items-center gap-1.5  text-ink-muted">
            <Mail size={14} aria-hidden="true" />
            {order.client.email}
          </span>
        )}
        {order.client.phone && (
          <span className="flex items-center gap-1.5  text-ink-muted">
            <Phone size={14} aria-hidden="true" />
            {order.client.phone}
          </span>
        )}
      </div>
      <Tabs
        fillHeight
        tabs={[
          { key: 'resumen', label: 'Resumen', content: <OrderSummaryTab order={order} /> },
          {
            key: 'productos',
            label: 'Productos',
            content: <OrderItemsList items={order.items} />,
          },
          { key: 'seguimiento', label: 'Seguimiento', content: <OrderTimeline order={order} /> },
          { key: 'notas', label: 'Notas', content: <OrderNotesTab orderId={order.id} /> },
          { key: 'etiquetas', label: 'Etiquetas', content: <OrderTagsTab order={order} /> },
        ]}
      />
    </div>
  )
}

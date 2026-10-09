import { Tabs } from '@/shared/components'
import { useOrderDetail } from '../hooks/useOrderDetail'
import { OrderSummaryTab } from './OrderSummaryTab'
import { OrderItemsList } from './OrderItemsList'

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
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">Pedido #{order.number}</h2>
      <Tabs
        tabs={[
          { key: 'resumen', label: 'Resumen', content: <OrderSummaryTab order={order} /> },
          { key: 'productos', label: 'Productos', content: <OrderItemsList items={order.items} /> },
          { key: 'seguimiento', label: 'Seguimiento', content: null },
          { key: 'notas', label: 'Notas', content: null },
          {
            key: 'etiquetas',
            label: 'Etiquetas',
            content: null,
            disabled: true,
          },
        ]}
      />
    </div>
  )
}

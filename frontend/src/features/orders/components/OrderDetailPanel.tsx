import { Badge, Tabs } from '@/shared/components'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_ICONS } from '../orderStatus.constants'
import { useOrderDetail } from '../hooks/useOrderDetail'

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
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">Pedido #{order.number}</h2>
        <Badge color={ORDER_STATUS_COLORS[order.status]} icon={ORDER_STATUS_ICONS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>
      <Tabs
        tabs={[
          { key: 'resumen', label: 'Resumen', content: null },
          { key: 'productos', label: 'Productos', content: null },
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

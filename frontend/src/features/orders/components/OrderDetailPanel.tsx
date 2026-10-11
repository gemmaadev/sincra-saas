import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar, IconButton, Tabs } from '@/shared/components'
import { useOrderDetail } from '../hooks/useOrderDetail'
import { OrderFormModal } from './OrderFormModal'
import { OrderSummaryTab } from './OrderSummaryTab'
import { OrderItemsList } from './OrderItemsList'
import { OrderTimeline } from './OrderTimeline'
import { OrderNotesTab } from './OrderNotesTab'
import { OrderTagsTab } from './OrderTagsTab'
import { CancelOrderModal } from './CancelOrderModal'
import { DeleteOrderModal } from './DeleteOrderModal'
import { Mail, Phone, Pencil, X, Trash2 } from 'lucide-react'

interface OrderDetailPanelProps {
  id: string
}

export function OrderDetailPanel({ id }: OrderDetailPanelProps) {
  const navigate = useNavigate()
  const { data: order, isLoading, isError } = useOrderDetail(id)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  if (isLoading) {
    return <p className="text-ink-muted">Cargando pedido...</p>
  }

  if (isError || !order) {
    return <p className="text-error">No se ha podido cargar el pedido.</p>
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Pedido #{order.number}</h2>
        <div className="flex gap-2">
          <IconButton
            icon={Pencil}
            label="Editar pedido"
            variant="secondary"
            onClick={() => setIsEditModalOpen(true)}
          />
          <IconButton
            icon={X}
            label="Cancelar pedido"
            variant="dangerOutline"
            disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
            onClick={() => setIsCancelModalOpen(true)}
          />
          <IconButton
            icon={Trash2}
            label="Eliminar pedido"
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          />
        </div>
      </div>
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

      <OrderFormModal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={order}
      />
      <CancelOrderModal
        order={order}
        opened={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onCancelled={() => setIsCancelModalOpen(false)}
      />
      <DeleteOrderModal
        order={order}
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => navigate('/orders')}
      />
    </div>
  )
}

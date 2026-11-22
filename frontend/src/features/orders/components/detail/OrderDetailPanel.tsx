import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AiSuggestedBadge, Avatar, IconButton, Tabs, Spinner } from '@/shared/components'
import { useOrderDetail } from '../../hooks/useOrderDetail'
import { useOrderNotes } from '../../hooks/useOrderNotes'
import { OrderFormModal } from '../form/OrderFormModal'
import { OrderSummaryTab } from './OrderSummaryTab'
import { OrderItemsList } from './OrderItemsList'
import { OrderTimeline } from './OrderTimeline'
import { OrderNotesTab } from './OrderNotesTab'
import { OrderTagsTab } from './OrderTagsTab'
import { CancelOrderModal } from '../actions/CancelOrderModal'
import { DeleteOrderModal } from '../actions/DeleteOrderModal'
import { canCancelOrder } from '../../utils/operationalStatus'
import { Mail, Phone, Pencil, X, Trash2 } from 'lucide-react'

interface OrderDetailPanelProps {
  id: string
}

export function OrderDetailPanel({ id }: OrderDetailPanelProps) {
  const navigate = useNavigate()
  const { data: order, isLoading, isError } = useOrderDetail(id)
  const notesQuery = useOrderNotes(id)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" label="Cargando pedido" />
      </div>
    )
  }

  if (isError || !order) {
    return <p className="text-error">No se ha podido cargar el pedido.</p>
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-ink">Pedido #{order.number}</h2>
          {order.aiGenerated && <AiSuggestedBadge />}
        </div>
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
            disabled={!canCancelOrder(order.status, order.statusHistory)}
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
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/clients/${order.client.id}`)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            navigate(`/clients/${order.client.id}`)
          }
        }}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-1 text-xs hover:bg-surface-hover focus:outline-2 focus:outline-primary"
      >
        <Avatar name={order.client.name} size="xs" roundness="rounded" />
        <div className="flex flex-col gap-1">
          <span className="text-ink">{order.client.name}</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {order.client.email && (
              <span className="flex items-center gap-1.5 text-ink-muted">
                <Mail size={14} aria-hidden="true" />
                {order.client.email}
              </span>
            )}
            {order.client.phone && (
              <span className="flex items-center gap-1.5 text-ink-muted">
                <Phone size={14} aria-hidden="true" />
                {order.client.phone}
              </span>
            )}
          </div>
        </div>
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
          {
            key: 'notas',
            label: 'Notas',
            count: notesQuery.data?.length,
            content: <OrderNotesTab orderId={order.id} />,
          },
          {
            key: 'etiquetas',
            label: 'Etiquetas',
            count: order.orderTags.length,
            content: <OrderTagsTab order={order} />,
          },
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

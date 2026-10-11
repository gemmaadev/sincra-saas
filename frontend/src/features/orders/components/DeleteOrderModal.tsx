import { ConfirmDeleteModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useDeleteOrder } from '../hooks/useDeleteOrder'
import type { OrderDetail } from '../types/order.types'

interface DeleteOrderModalProps {
  order: Pick<OrderDetail, 'id' | 'number'>
  opened: boolean
  onClose: () => void
  onDeleted: () => void
}

export function DeleteOrderModal({ order, opened, onClose, onDeleted }: DeleteOrderModalProps) {
  const deleteOrder = useDeleteOrder(order.id)

  function handleClose() {
    deleteOrder.reset()
    onClose()
  }

  function handleDelete() {
    deleteOrder.mutate(undefined, {
      onSuccess: () => {
        notifySuccess('Pedido eliminado')
        handleClose()
        onDeleted()
      },
    })
  }

  const error = deleteOrder.isError
    ? deleteOrder.error instanceof ApiError
      ? deleteOrder.error.message
      : 'No se ha podido eliminar el pedido. Inténtalo de nuevo.'
    : undefined

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleDelete}
      isLoading={deleteOrder.isPending}
      error={error}
      title="¿Eliminar pedido?"
      message={`Vas a eliminar el pedido #${order.number}. Esta acción es solo para pedidos erróneos y no se puede deshacer.`}
    />
  )
}

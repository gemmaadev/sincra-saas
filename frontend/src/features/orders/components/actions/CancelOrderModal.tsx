import { ConfirmDeleteModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus'
import type { OrderDetail } from '../../types/order.types'

interface CancelOrderModalProps {
  order: Pick<OrderDetail, 'id' | 'number'>
  opened: boolean
  onClose: () => void
  onCancelled: () => void
}

export function CancelOrderModal({ order, opened, onClose, onCancelled }: CancelOrderModalProps) {
  const updateStatus = useUpdateOrderStatus(order.id)

  function handleClose() {
    updateStatus.reset()
    onClose()
  }

  function handleCancel() {
    updateStatus.mutate('CANCELLED', {
      onSuccess: () => {
        notifySuccess('Pedido cancelado')
        handleClose()
        onCancelled()
      },
    })
  }

  const error = updateStatus.isError
    ? updateStatus.error instanceof ApiError
      ? updateStatus.error.message
      : 'No se ha podido cancelar el pedido. Inténtalo de nuevo.'
    : undefined

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleCancel}
      isLoading={updateStatus.isPending}
      error={error}
      title="¿Cancelar pedido?"
      message={`Vas a cancelar el pedido #${order.number}. El registro se mantendrá, pero pasará a estado Cancelado.`}
      confirmLabel="Cancelar pedido"
    />
  )
}

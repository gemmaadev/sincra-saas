import { ConfirmDeleteModal } from '@/shared/components'
import { notifySuccess } from '@/shared/utils/notify'
import { useBulkCancelOrders } from '../hooks/useBulkCancelOrders'

interface BulkCancelOrdersModalProps {
  opened: boolean
  onClose: () => void
  orderIds: string[]
  onCancelled: () => void
}

export function BulkCancelOrdersModal({
  opened,
  onClose,
  orderIds,
  onCancelled,
}: BulkCancelOrdersModalProps) {
  const bulkCancel = useBulkCancelOrders()
  const count = orderIds.length
  const isSingle = count === 1

  function handleClose() {
    bulkCancel.reset()
    onClose()
  }

  function handleConfirm() {
    bulkCancel.mutate(orderIds, {
      onSuccess: ({ failedIds }) => {
        if (failedIds.length > 0) return

        notifySuccess(isSingle ? 'Pedido cancelado' : `${count} pedidos cancelados`)
        handleClose()
        onCancelled()
      },
    })
  }

  const failedCount = bulkCancel.data?.failedIds.length ?? 0
  const errorMessage =
    failedCount > 0
      ? `No se han podido cancelar ${failedCount} de ${count} pedidos. Puede que alguno ya estuviera entregado.`
      : bulkCancel.isError
        ? 'No se han podido cancelar los pedidos. Inténtalo de nuevo.'
        : undefined

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleConfirm}
      isLoading={bulkCancel.isPending}
      error={errorMessage}
      title={isSingle ? '¿Cancelar 1 pedido?' : `¿Cancelar ${count} pedidos?`}
      message="El registro se mantendrá, pero pasará a estado Cancelado."
      confirmLabel="Cancelar pedidos"
    />
  )
}

import { ConfirmDeleteModal } from '@/shared/components'
import { notifySuccess } from '@/shared/utils/notify'
import { useBulkDeleteOrders } from '../../hooks/useBulkDeleteOrders'

interface BulkDeleteOrdersModalProps {
  opened: boolean
  onClose: () => void
  orderIds: string[]
  onDeleted: () => void
}

export function BulkDeleteOrdersModal({
  opened,
  onClose,
  orderIds,
  onDeleted,
}: BulkDeleteOrdersModalProps) {
  const bulkDelete = useBulkDeleteOrders()
  const count = orderIds.length
  const isSingle = count === 1

  function handleClose() {
    bulkDelete.reset()
    onClose()
  }

  function handleConfirm() {
    bulkDelete.mutate(orderIds, {
      onSuccess: ({ failedIds }) => {
        if (failedIds.length > 0) return

        notifySuccess(isSingle ? 'Pedido eliminado' : `${count} pedidos eliminados`)
        handleClose()
        onDeleted()
      },
    })
  }

  const failedCount = bulkDelete.data?.failedIds.length ?? 0
  const errorMessage =
    failedCount > 0
      ? `No se han podido eliminar ${failedCount} de ${count} pedidos. Inténtalo de nuevo.`
      : bulkDelete.isError
        ? 'No se han podido eliminar los pedidos. Inténtalo de nuevo.'
        : undefined

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleConfirm}
      isLoading={bulkDelete.isPending}
      error={errorMessage}
      title={isSingle ? '¿Eliminar 1 pedido?' : `¿Eliminar ${count} pedidos?`}
      message="Esta acción es solo para pedidos erróneos y no se puede deshacer."
    />
  )
}

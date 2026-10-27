import { ConfirmDeleteModal } from '@/shared/components'
import { notifySuccess } from '@/shared/utils/notify'
import { useBulkDeleteClients } from '../../hooks/useBulkDeleteClients'

interface BulkDeleteClientsModalProps {
  opened: boolean
  onClose: () => void
  clientIds: string[]
  onDeleted: () => void
}

export function BulkDeleteClientsModal({
  opened,
  onClose,
  clientIds,
  onDeleted,
}: BulkDeleteClientsModalProps) {
  const bulkDelete = useBulkDeleteClients()
  const count = clientIds.length
  const isSingle = count === 1

  function handleClose() {
    bulkDelete.reset()
    onClose()
  }

  function handleConfirm() {
    bulkDelete.mutate(clientIds, {
      onSuccess: ({ failedIds }) => {
        if (failedIds.length > 0) return

        notifySuccess(isSingle ? 'Cliente eliminado' : `${count} clientes eliminados`)
        handleClose()
        onDeleted()
      },
    })
  }

  const failedCount = bulkDelete.data?.failedIds.length ?? 0
  const errorMessage =
    failedCount > 0
      ? `No se han podido eliminar ${failedCount} de ${count} clientes. Inténtalo de nuevo.`
      : bulkDelete.isError
        ? 'No se han podido eliminar los clientes. Inténtalo de nuevo.'
        : undefined

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleConfirm}
      isLoading={bulkDelete.isPending}
      error={errorMessage}
      title={isSingle ? '¿Eliminar 1 cliente?' : `¿Eliminar ${count} clientes?`}
      message="Se eliminarán también sus notas y etiquetas. Esta acción no se puede deshacer."
    />
  )
}

import { ConfirmDeleteModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useDeleteClient } from '../../hooks/useDeleteClient'
import type { ClientDetail } from '../../types/client.types'

interface DeleteClientModalProps {
  client: Pick<ClientDetail, 'id' | 'name'>
  opened: boolean
  onClose: () => void
  onDeleted: () => void
}

export function DeleteClientModal({ client, opened, onClose, onDeleted }: DeleteClientModalProps) {
  const deleteClient = useDeleteClient(client.id)

  function handleClose() {
    deleteClient.reset()
    onClose()
  }

  function handleDelete() {
    deleteClient.mutate(undefined, {
      onSuccess: () => {
        notifySuccess('Cliente eliminado')
        handleClose()
        onDeleted()
      },
    })
  }

  const error = deleteClient.isError
    ? deleteClient.error instanceof ApiError
      ? deleteClient.error.message
      : 'No se ha podido eliminar el cliente. Inténtalo de nuevo.'
    : undefined

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleDelete}
      isLoading={deleteClient.isPending}
      error={error}
      title="¿Eliminar cliente?"
      message={`Vas a eliminar a ${client.name}. Se eliminarán también sus notas y etiquetas. Esta acción no se puede deshacer.`}
    />
  )
}

import { ConfirmDeleteModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useDeleteCalendarEvent } from '../hooks/useDeleteCalendarEvent'

interface DeleteEventModalProps {
  eventId: string
  eventTitle: string
  opened: boolean
  onClose: () => void
  onDeleted: () => void
}

export function DeleteEventModal({
  eventId,
  eventTitle,
  opened,
  onClose,
  onDeleted,
}: DeleteEventModalProps) {
  const deleteEvent = useDeleteCalendarEvent(eventId)

  function handleClose() {
    deleteEvent.reset()
    onClose()
  }

  function handleDelete() {
    deleteEvent.mutate(undefined, {
      onSuccess: () => {
        notifySuccess('Evento eliminado')
        handleClose()
        onDeleted()
      },
    })
  }

  const error = deleteEvent.isError
    ? deleteEvent.error instanceof ApiError
      ? deleteEvent.error.message
      : 'No se ha podido eliminar el evento. Inténtalo de nuevo.'
    : undefined

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleDelete}
      isLoading={deleteEvent.isPending}
      error={error}
      title="¿Eliminar evento?"
      message={`Vas a eliminar "${eventTitle}". Esta acción no se puede deshacer.`}
    />
  )
}

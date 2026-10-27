import { Calendar } from 'lucide-react'
import { SincraModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useSaveCalendarEvent } from '../../hooks/useSaveCalendarEvent'
import { EventForm } from './EventForm'
import type { CalendarEventFormValues, CalendarItem } from '../../types/calendar.types'

interface EventFormModalProps {
  opened: boolean
  onClose: () => void
  event?: CalendarItem
  initialDate?: Date
}

export function EventFormModal({ opened, onClose, event, initialDate }: EventFormModalProps) {
  const isEditing = event !== undefined
  const saveEvent = useSaveCalendarEvent(event?.id)

  function handleClose() {
    saveEvent.reset()
    onClose()
  }

  function handleSaved() {
    notifySuccess(isEditing ? 'Evento actualizado' : 'Evento creado')
    handleClose()
  }

  function handleSubmit(values: CalendarEventFormValues) {
    saveEvent.mutate(values, { onSuccess: handleSaved })
  }

  const submitError = saveEvent.isError
    ? saveEvent.error instanceof ApiError
      ? saveEvent.error.message
      : 'No se ha podido guardar el evento. Inténtalo de nuevo.'
    : undefined

  return (
    <SincraModal
      opened={opened}
      onClose={handleClose}
      title={isEditing ? 'Editar evento' : 'Nuevo evento'}
      icon={<Calendar size={26} className="text-primary" aria-hidden="true" />}
    >
      <EventForm
        event={event}
        initialDate={initialDate}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isSubmitting={saveEvent.isPending}
        submitError={submitError}
      />
    </SincraModal>
  )
}

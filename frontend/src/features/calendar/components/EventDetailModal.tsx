import { Calendar, Pencil, Trash2 } from 'lucide-react'
import { SincraModal, SincraButton } from '@/shared/components'
import { formatDateTime } from '@/shared/utils'
import type { CalendarItem } from '../types/calendar.types'

interface EventDetailModalProps {
  opened: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  event: CalendarItem
}

export function EventDetailModal({
  opened,
  onClose,
  onEdit,
  onDelete,
  event,
}: EventDetailModalProps) {
  const linkedTo = event.clientName ?? event.orderLabel

  return (
    <SincraModal
      opened={opened}
      onClose={onClose}
      title={event.title}
      icon={<Calendar size={26} className="text-primary" aria-hidden="true" />}
    >
      <div className="flex flex-col gap-5">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Fecha</dt>
            <dd className="text-ink">{formatDateTime(new Date(event.date))}</dd>
          </div>
          {linkedTo && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Vinculado a</dt>
              <dd className="text-ink">{linkedTo}</dd>
            </div>
          )}
        </dl>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink">Descripción</span>
          <p className="text-sm text-ink-muted">
            {event.description || 'Sin descripción.'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-5">
          {event.editable ? (
            <SincraButton type="button" variant="dangerOutline" onClick={onDelete}>
              <Trash2 size={16} aria-hidden="true" />
              Eliminar
            </SincraButton>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <SincraButton type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </SincraButton>
            {event.editable && (
              <SincraButton type="button" onClick={onEdit}>
                <Pencil size={16} aria-hidden="true" />
                Editar
              </SincraButton>
            )}
          </div>
        </div>
      </div>
    </SincraModal>
  )
}

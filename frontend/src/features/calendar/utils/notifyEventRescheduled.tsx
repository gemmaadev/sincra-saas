import { notifyWithUndo } from '@/shared/utils/notify'

export function notifyEventRescheduled(newDate: Date, onUndo: () => void) {
  const label = newDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
  notifyWithUndo(`Evento movido al ${label}`, onUndo)
}

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { EventFormModal } from '@/features/calendar/components/EventFormModal'
import { EventDetailModal } from '@/features/calendar/components/EventDetailModal'
import { DeleteEventModal } from '@/features/calendar/components/DeleteEventModal'
import { SincraButton } from '@/shared/components'
import type { CalendarItem } from '@/features/calendar/types/calendar.types'

type EventModalState =
  | { mode: 'closed' }
  | { mode: 'create'; date?: Date }
  | { mode: 'preview'; event: CalendarItem }
  | { mode: 'edit'; event: CalendarItem }
  | { mode: 'delete'; event: CalendarItem }

export default function CalendarPage() {
  const [modalState, setModalState] = useState<EventModalState>({ mode: 'closed' })

  function closeModal() {
    setModalState({ mode: 'closed' })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-ink">Calendario</h1>
          <p className="text-ink">
            Organiza tus pedidos y seguimientos sin perder de vista ninguna fecha.
          </p>
        </div>
        <SincraButton className="shrink-0" onClick={() => setModalState({ mode: 'create' })}>
          <Plus size={16} aria-hidden="true" />
          Nuevo evento
        </SincraButton>
      </div>
      <CalendarView
        onDateClick={(date) => setModalState({ mode: 'create', date })}
        onEventClick={(event) => setModalState({ mode: 'preview', event })}
      />
      {modalState.mode === 'preview' && (
        <EventDetailModal
          opened
          onClose={closeModal}
          onEdit={() => setModalState({ mode: 'edit', event: modalState.event })}
          onDelete={() => setModalState({ mode: 'delete', event: modalState.event })}
          event={modalState.event}
        />
      )}
      {modalState.mode === 'delete' && (
        <DeleteEventModal
          opened
          onClose={closeModal}
          onDeleted={closeModal}
          eventId={modalState.event.id}
          eventTitle={modalState.event.title}
        />
      )}
      <EventFormModal
        opened={modalState.mode === 'create' || modalState.mode === 'edit'}
        onClose={closeModal}
        event={modalState.mode === 'edit' ? modalState.event : undefined}
        initialDate={modalState.mode === 'create' ? modalState.date : undefined}
      />
    </div>
  )
}

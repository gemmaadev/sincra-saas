import { Plus } from 'lucide-react'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { SincraButton } from '@/shared/components'

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-ink">Calendario</h1>
          <p className="text-ink">
            Organiza tus pedidos y seguimientos sin perder de vista ninguna fecha.
          </p>
        </div>
        <SincraButton className="shrink-0" disabled>
          <Plus size={16} aria-hidden="true" />
          Nuevo evento
        </SincraButton>
      </div>
      <CalendarView />
    </div>
  )
}

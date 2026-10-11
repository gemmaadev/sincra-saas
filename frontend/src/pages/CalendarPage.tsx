import { CalendarView } from '@/features/calendar/components/CalendarView'

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-ink">Calendario</h1>
        <p className="text-ink">
          Organiza tus pedidos y seguimientos sin perder de vista ninguna fecha.
        </p>
      </div>
      <CalendarView />
    </div>
  )
}

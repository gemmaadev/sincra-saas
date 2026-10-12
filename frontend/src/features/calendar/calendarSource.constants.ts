import { CalendarClock, Package, Sparkles, Calendar, type LucideIcon } from 'lucide-react'
import type { CalendarEventSource } from './types/calendar.types'

export const CALENDAR_SOURCE_LABELS: Record<CalendarEventSource, string> = {
  MANUAL: 'Seguimiento',
  ORDER: 'Entrega pedido',
  AI: 'Sugerido por IA',
  GOOGLE: 'Google Calendar',
  OUTLOOK: 'Outlook Calendar',
}

export const CALENDAR_SOURCE_BACKGROUND_CLASSES: Record<CalendarEventSource, string> = {
  MANUAL: 'bg-primary',
  ORDER: 'bg-primary-dark',
  AI: 'bg-success',
  GOOGLE: 'bg-gmail',
  OUTLOOK: 'bg-outlook',
}

export const CALENDAR_SOURCE_ICONS: Record<CalendarEventSource, LucideIcon> = {
  MANUAL: CalendarClock,
  ORDER: Package,
  AI: Sparkles,
  GOOGLE: Calendar,
  OUTLOOK: Calendar,
}

interface CalendarDelta {
  years: number
  months: number
  days: number
  milliseconds: number
}

// FullCalendar's post-drop dates lose the time on multi-day events — shift our own instead.
export function applyCalendarDelta(date: Date, delta: CalendarDelta): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + delta.years)
  result.setMonth(result.getMonth() + delta.months)
  result.setDate(result.getDate() + delta.days)
  result.setMilliseconds(result.getMilliseconds() + delta.milliseconds)
  return result
}

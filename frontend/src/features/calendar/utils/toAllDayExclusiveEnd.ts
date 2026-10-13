// FullCalendar's all-day end is exclusive, so a day only partially touched still needs +1.
export function toAllDayExclusiveEnd(endDate: string): string {
  const end = new Date(endDate)
  const endDayStart = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  const endsExactlyAtMidnight = end.getTime() === endDayStart.getTime()
  const exclusiveEnd = endsExactlyAtMidnight
    ? endDayStart
    : new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
  return exclusiveEnd.toISOString()
}

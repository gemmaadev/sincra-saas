export function isMultiDayEvent(date: string, endDate: string): boolean {
  return new Date(date).toDateString() !== new Date(endDate).toDateString()
}

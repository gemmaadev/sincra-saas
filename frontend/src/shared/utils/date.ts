export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateRange(start: Date, end: Date) {
  if (start.getTime() === end.getTime()) {
    return formatDateTime(start)
  }

  const sameDay = start.toDateString() === end.toDateString()
  if (sameDay) {
    return `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`
  }

  return `${formatDateTime(start)} – ${formatDateTime(end)}`
}

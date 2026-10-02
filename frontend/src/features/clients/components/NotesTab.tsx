import type { ClientDetail } from '../hooks/useClientDetail'

interface NotesTabProps {
  client: ClientDetail
}

export function NotesTab({ client }: NotesTabProps) {
  if (!client.notes) {
    return <p className="text-sm text-ink-muted">Todavía no hay notas para este cliente.</p>
  }

  return <p className="whitespace-pre-wrap text-sm text-ink">{client.notes}</p>
}

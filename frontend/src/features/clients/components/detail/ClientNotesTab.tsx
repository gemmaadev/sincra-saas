import { NotesTab } from '@/shared/components'
import { useClientNotes } from '../../hooks/useClientNotes'
import { useCreateNote } from '../../hooks/useCreateNote'
import { useDeleteNote } from '../../hooks/useDeleteNote'

interface ClientNotesTabProps {
  clientId: string
}

export function ClientNotesTab({ clientId }: ClientNotesTabProps) {
  const notesQuery = useClientNotes(clientId)
  const createNote = useCreateNote(clientId)
  const deleteNote = useDeleteNote(clientId)

  return (
    <NotesTab
      notesQuery={notesQuery}
      createNote={createNote}
      deleteNote={deleteNote}
      placeholder="Escribe una nota sobre este cliente..."
      emptyMessage="Todavía no hay notas para este cliente."
    />
  )
}

import { NotesTab } from '@/shared/components'
import { useOrderNotes } from '../hooks/useOrderNotes'
import { useCreateOrderNote } from '../hooks/useCreateOrderNote'
import { useDeleteOrderNote } from '../hooks/useDeleteOrderNote'

interface OrderNotesTabProps {
  orderId: string
}

export function OrderNotesTab({ orderId }: OrderNotesTabProps) {
  const notesQuery = useOrderNotes(orderId)
  const createNote = useCreateOrderNote(orderId)
  const deleteNote = useDeleteOrderNote(orderId)

  return (
    <NotesTab
      notesQuery={notesQuery}
      createNote={createNote}
      deleteNote={deleteNote}
      placeholder="Escribe una nota sobre este pedido..."
      emptyMessage="Todavía no hay notas para este pedido."
    />
  )
}

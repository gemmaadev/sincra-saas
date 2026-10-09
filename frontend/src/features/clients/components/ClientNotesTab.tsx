import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { SincraButton, ConfirmDeleteModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { formatDateTime } from '@/shared/utils/date'
import { notifySuccess } from '@/shared/utils/notify'
import { useClientNotes } from '../hooks/useClientNotes'
import { useCreateNote } from '../hooks/useCreateNote'
import { useDeleteNote } from '../hooks/useDeleteNote'
import type { Note } from '../types/note.types'

interface ClientNotesTabProps {
  clientId: string
}

export function ClientNotesTab({ clientId }: ClientNotesTabProps) {
  const [content, setContent] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const { data: notes = [], isLoading, isError } = useClientNotes(clientId)
  const createNote = useCreateNote(clientId)
  const deleteNote = useDeleteNote(clientId)

  function handleAdd() {
    createNote.mutate(content, { onSuccess: () => setContent('') })
  }

  function closeDeleteModal() {
    deleteNote.reset()
    setNoteToDelete(null)
  }

  function handleDelete() {
    if (!noteToDelete) return

    deleteNote.mutate(noteToDelete.id, {
      onSuccess: () => {
        notifySuccess('Nota eliminada')
        closeDeleteModal()
      },
    })
  }

  const deleteError = deleteNote.isError
    ? deleteNote.error instanceof ApiError
      ? deleteNote.error.message
      : 'No se ha podido eliminar la nota. Inténtalo de nuevo.'
    : undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          placeholder="Escribe una nota sobre este cliente..."
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex justify-end items-center gap-2">
          <SincraButton
            size="sm"
            disabled={!content.trim()}
            loading={createNote.isPending}
            onClick={handleAdd}
          >
            Añadir nota
          </SincraButton>
          {createNote.isError && (
            <span className="text-sm text-error">No se ha podido guardar la nota.</span>
          )}
        </div>
      </div>

      {isLoading && <p className="text-sm text-ink-muted">Cargando notas...</p>}
      {isError && <p className="text-sm text-error">No se han podido cargar las notas.</p>}
      {!isLoading && !isError && notes.length === 0 && (
        <p className="text-sm text-ink-muted">Todavía no hay notas para este cliente.</p>
      )}
      {!isLoading && !isError && notes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-neutral-100 p-3"
            >
              <div className="flex flex-col gap-1">
                <p className="whitespace-pre-wrap text-sm text-ink">{note.content}</p>
                <span className="text-xs text-ink-muted">
                  {formatDateTime(new Date(note.createdAt))}
                </span>
              </div>
              <button
                type="button"
                aria-label="Eliminar nota"
                onClick={() => setNoteToDelete(note)}
                className="shrink-0 text-ink-muted hover:text-error cursor-pointer"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDeleteModal
        opened={noteToDelete !== null}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isLoading={deleteNote.isPending}
        error={deleteError}
        title="¿Eliminar nota?"
        message="Se eliminará esta nota. Esta acción no se puede deshacer."
      />
    </div>
  )
}

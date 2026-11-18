const SINCRO_NOTE_PREFIX = 'Sugerido por IA:'

export const SINCRO_NOTE_LABEL = 'Sugerido por Sincro'

export function isSincroNote(note: { content: string; createdBy: string | null }): boolean {
  return note.createdBy == null || note.content.trimStart().startsWith(SINCRO_NOTE_PREFIX)
}

export function sincroNoteBody(content: string): string {
  const trimmed = content.trimStart()
  if (!trimmed.startsWith(SINCRO_NOTE_PREFIX)) return content

  return trimmed.slice(SINCRO_NOTE_PREFIX.length).replace(/^\s+/, '')
}

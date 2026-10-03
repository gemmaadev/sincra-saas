import { AppError } from '../../shared/AppError'
import { findClientById } from '../client/client.model'
import { findNotesByClient, insertNote, findNoteWithClient, deleteNoteById } from './note.model'

async function assertClientExists(businessId: string, clientId: string) {
  const client = await findClientById(businessId, clientId)

  if (!client) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }
}

export async function listNotesForClient(businessId: string, clientId: string) {
  await assertClientExists(businessId, clientId)

  return findNotesByClient(clientId)
}

export async function createNote(
  businessId: string,
  clientId: string,
  content: string,
  createdBy: string,
) {
  await assertClientExists(businessId, clientId)

  return insertNote(clientId, content, createdBy)
}

export async function deleteNote(businessId: string, noteId: string) {
  const note = await findNoteWithClient(noteId)

  if (!note || note.client.businessId !== businessId) {
    throw new AppError('Nota no encontrada', 404, 'NOTE_NOT_FOUND')
  }

  await deleteNoteById(noteId)
}

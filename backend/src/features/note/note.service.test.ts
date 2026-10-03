import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clientModel from '../client/client.model'
import * as noteModel from './note.model'
import { listNotesForClient, createNote, deleteNote } from './note.service'

vi.mock('../client/client.model')
vi.mock('./note.model')

beforeEach(() => vi.resetAllMocks())

describe('listNotesForClient / createNote', () => {
  // Given a client that does not belong to the business
  // When notes are listed or created
  // Then CLIENT_NOT_FOUND is thrown and the note model is not touched
  it('rejects when the client is not in the business', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue(null)

    await expect(listNotesForClient('business-1', 'client-1')).rejects.toMatchObject({
      code: 'CLIENT_NOT_FOUND',
    })
    await expect(createNote('business-1', 'client-1', 'hola', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
    })
    expect(noteModel.findNotesByClient).not.toHaveBeenCalled()
    expect(noteModel.insertNote).not.toHaveBeenCalled()
  })

  // Given an existing client
  // When a note is created
  // Then it is inserted with the author
  it('creates the note for an existing client', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)

    await createNote('business-1', 'client-1', 'hola', 'user-1')

    expect(noteModel.insertNote).toHaveBeenCalledWith('client-1', 'hola', 'user-1')
  })
})

describe('deleteNote', () => {
  // Given a note whose client belongs to another business
  // When it is deleted
  // Then NOTE_NOT_FOUND is thrown (no cross-tenant deletes)
  it('does not delete notes of another business', async () => {
    vi.mocked(noteModel.findNoteWithClient).mockResolvedValue({
      id: 'note-1',
      client: { businessId: 'other-business' },
    } as never)

    await expect(deleteNote('business-1', 'note-1')).rejects.toMatchObject({
      code: 'NOTE_NOT_FOUND',
    })
    expect(noteModel.deleteNoteById).not.toHaveBeenCalled()
  })

  // Given a note of the same business
  // When it is deleted
  // Then the model deletes it
  it('deletes a note of the same business', async () => {
    vi.mocked(noteModel.findNoteWithClient).mockResolvedValue({
      id: 'note-1',
      client: { businessId: 'business-1' },
    } as never)

    await deleteNote('business-1', 'note-1')

    expect(noteModel.deleteNoteById).toHaveBeenCalledWith('note-1')
  })
})

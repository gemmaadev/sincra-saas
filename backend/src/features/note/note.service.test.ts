import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clientModel from '../client/client.model'
import * as orderModel from '../order/order.model'
import * as noteModel from './note.model'
import {
  listNotesForClient,
  createNoteForClient,
  listNotesForOrder,
  createNoteForOrder,
  deleteNote,
} from './note.service'

vi.mock('../client/client.model')
vi.mock('../order/order.model')
vi.mock('./note.model')

beforeEach(() => vi.resetAllMocks())

describe('listNotesForClient / createNoteForClient', () => {
  // Given a client that does not belong to the business
  // When notes are listed or created
  // Then CLIENT_NOT_FOUND is thrown and the note model is not touched
  it('rejects when the client is not in the business', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue(null)

    await expect(listNotesForClient('business-1', 'client-1')).rejects.toMatchObject({
      code: 'CLIENT_NOT_FOUND',
    })
    await expect(
      createNoteForClient('business-1', 'client-1', 'hola', 'user-1'),
    ).rejects.toMatchObject({ statusCode: 404 })
    expect(noteModel.findNotesByClient).not.toHaveBeenCalled()
    expect(noteModel.insertClientNote).not.toHaveBeenCalled()
  })

  // Given an existing client
  // When a note is created
  // Then it is inserted with the author
  it('creates the note for an existing client', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)

    await createNoteForClient('business-1', 'client-1', 'hola', 'user-1')

    expect(noteModel.insertClientNote).toHaveBeenCalledWith('client-1', 'hola', 'user-1')
  })
})

describe('listNotesForOrder / createNoteForOrder', () => {
  // Given an order that does not belong to the business
  // When notes are listed or created
  // Then ORDER_NOT_FOUND is thrown and the note model is not touched
  it('rejects when the order is not in the business', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue(null)

    await expect(listNotesForOrder('business-1', 'order-1')).rejects.toMatchObject({
      code: 'ORDER_NOT_FOUND',
    })
    await expect(
      createNoteForOrder('business-1', 'order-1', 'hola', 'user-1'),
    ).rejects.toMatchObject({ statusCode: 404 })
    expect(noteModel.findNotesByOrder).not.toHaveBeenCalled()
    expect(noteModel.insertOrderNote).not.toHaveBeenCalled()
  })

  // Given an existing order
  // When a note is created
  // Then it is inserted with the author
  it('creates the note for an existing order', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)

    await createNoteForOrder('business-1', 'order-1', 'hola', 'user-1')

    expect(noteModel.insertOrderNote).toHaveBeenCalledWith('order-1', 'hola', 'user-1')
  })
})

describe('deleteNote', () => {
  // Given a client note whose client belongs to another business
  // When it is deleted
  // Then NOTE_NOT_FOUND is thrown (no cross-tenant deletes)
  it('does not delete client notes of another business', async () => {
    vi.mocked(noteModel.findNoteWithOwner).mockResolvedValue({
      id: 'note-1',
      client: { businessId: 'other-business' },
      order: null,
    } as never)

    await expect(deleteNote('business-1', 'note-1')).rejects.toMatchObject({
      code: 'NOTE_NOT_FOUND',
    })
    expect(noteModel.deleteNoteById).not.toHaveBeenCalled()
  })

  // Given an order note whose order belongs to another business
  // When it is deleted
  // Then NOTE_NOT_FOUND is thrown (no cross-tenant deletes)
  it('does not delete order notes of another business', async () => {
    vi.mocked(noteModel.findNoteWithOwner).mockResolvedValue({
      id: 'note-1',
      client: null,
      order: { businessId: 'other-business' },
    } as never)

    await expect(deleteNote('business-1', 'note-1')).rejects.toMatchObject({
      code: 'NOTE_NOT_FOUND',
    })
    expect(noteModel.deleteNoteById).not.toHaveBeenCalled()
  })

  // Given a client note of the same business
  // When it is deleted
  // Then the model deletes it
  it('deletes a client note of the same business', async () => {
    vi.mocked(noteModel.findNoteWithOwner).mockResolvedValue({
      id: 'note-1',
      client: { businessId: 'business-1' },
      order: null,
    } as never)

    await deleteNote('business-1', 'note-1')

    expect(noteModel.deleteNoteById).toHaveBeenCalledWith('note-1')
  })

  // Given an order note of the same business
  // When it is deleted
  // Then the model deletes it
  it('deletes an order note of the same business', async () => {
    vi.mocked(noteModel.findNoteWithOwner).mockResolvedValue({
      id: 'note-1',
      client: null,
      order: { businessId: 'business-1' },
    } as never)

    await deleteNote('business-1', 'note-1')

    expect(noteModel.deleteNoteById).toHaveBeenCalledWith('note-1')
  })
})

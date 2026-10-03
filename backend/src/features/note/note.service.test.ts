import { describe, it, expect } from 'vitest'
import prisma from '../../config/db'
import { listNotesForClient, createNote, deleteNote } from './note.service'

describe('note.service', () => {
  // Given a client with no notes
  // When createNote is called twice
  // Then listNotesForClient should return both, newest first
  it('creates notes and lists them newest first', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const client = await prisma.client.create({
      data: { businessId: business.id, name: 'Cliente de prueba' },
    })

    const first = await createNote(business.id, client.id, 'Primera nota', 'user-1')
    await new Promise((resolve) => setTimeout(resolve, 10))
    const second = await createNote(business.id, client.id, 'Segunda nota', 'user-1')

    const notes = await listNotesForClient(business.id, client.id)

    expect(notes).toHaveLength(2)
    expect(notes[0].id).toBe(second.id)
    expect(notes[1].id).toBe(first.id)

    await prisma.business.delete({ where: { id: business.id } })
  })

  // Given a client that belongs to a different business
  // When createNote is called for it with the wrong businessId
  // Then it should throw instead of creating the note
  it('rejects creating a note for a client from another business', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const otherBusiness = await prisma.business.create({ data: { name: 'Otro negocio' } })
    const otherClient = await prisma.client.create({
      data: { businessId: otherBusiness.id, name: 'Cliente ajeno' },
    })

    await expect(createNote(business.id, otherClient.id, 'Nota', 'user-1')).rejects.toThrow()

    await prisma.business.delete({ where: { id: business.id } })
    await prisma.business.delete({ where: { id: otherBusiness.id } })
  })

  // Given an existing note
  // When deleteNote is called with the right businessId
  // Then the note should be removed
  it('deletes a note', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const client = await prisma.client.create({
      data: { businessId: business.id, name: 'Cliente de prueba' },
    })
    const note = await createNote(business.id, client.id, 'Nota a borrar', 'user-1')

    await deleteNote(business.id, note.id)

    const notes = await listNotesForClient(business.id, client.id)
    expect(notes).toHaveLength(0)

    await prisma.business.delete({ where: { id: business.id } })
  })

  // Given a note that belongs to a different business
  // When deleteNote is called with the wrong businessId
  // Then it should throw instead of deleting it
  it('rejects deleting a note from another business', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const otherBusiness = await prisma.business.create({ data: { name: 'Otro negocio' } })
    const otherClient = await prisma.client.create({
      data: { businessId: otherBusiness.id, name: 'Cliente ajeno' },
    })
    const note = await createNote(otherBusiness.id, otherClient.id, 'Nota ajena', 'user-1')

    await expect(deleteNote(business.id, note.id)).rejects.toThrow()

    await prisma.business.delete({ where: { id: business.id } })
    await prisma.business.delete({ where: { id: otherBusiness.id } })
  })

  // Given a client that cascades its notes
  // When the client is deleted
  // Then its notes should be deleted too
  it('cascade-deletes notes when the client is deleted', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const client = await prisma.client.create({
      data: { businessId: business.id, name: 'Cliente de prueba' },
    })
    const note = await createNote(business.id, client.id, 'Nota', 'user-1')

    await prisma.client.delete({ where: { id: client.id } })

    const deletedNote = await prisma.note.findUnique({ where: { id: note.id } })
    expect(deletedNote).toBeNull()

    await prisma.business.delete({ where: { id: business.id } })
  })
})

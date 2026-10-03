import prisma from '../../config/db'

export async function findNotesByClient(clientId: string) {
  return prisma.note.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function insertNote(clientId: string, content: string, createdBy: string) {
  return prisma.note.create({
    data: { clientId, content, createdBy },
  })
}

export async function findNoteWithClient(noteId: string) {
  return prisma.note.findUnique({
    where: { id: noteId },
    include: { client: true },
  })
}

export async function deleteNoteById(noteId: string) {
  await prisma.note.delete({ where: { id: noteId } })
}

import prisma from '../../config/db'

export async function findNotesByClient(clientId: string) {
  return prisma.note.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findNotesByOrder(orderId: string) {
  return prisma.note.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function insertClientNote(clientId: string, content: string, createdBy: string) {
  return prisma.note.create({
    data: { clientId, content, createdBy },
  })
}

export async function insertOrderNote(orderId: string, content: string, createdBy: string) {
  return prisma.note.create({
    data: { orderId, content, createdBy },
  })
}

export async function findNoteWithOwner(noteId: string) {
  return prisma.note.findUnique({
    where: { id: noteId },
    include: { client: true, order: true },
  })
}

export async function deleteNoteById(noteId: string) {
  await prisma.note.delete({ where: { id: noteId } })
}

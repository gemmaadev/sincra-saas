import prisma from '../../config/db'
import { AppError } from '../../shared/AppError'

async function assertClientExists(businessId: string, clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId, businessId } })

  if (!client) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }
}

export async function listNotesForClient(businessId: string, clientId: string) {
  await assertClientExists(businessId, clientId)

  return prisma.note.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createNote(
  businessId: string,
  clientId: string,
  content: string,
  createdBy: string,
) {
  await assertClientExists(businessId, clientId)

  return prisma.note.create({
    data: { clientId, content, createdBy },
  })
}

export async function deleteNote(businessId: string, noteId: string) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { client: true },
  })

  if (!note || note.client.businessId !== businessId) {
    throw new AppError('Nota no encontrada', 404, 'NOTE_NOT_FOUND')
  }

  await prisma.note.delete({ where: { id: noteId } })
}

import { AppError } from '../../shared/AppError'
import { findClientById } from '../client/client.model'
import { findOrderById } from '../order/order.model'
import {
  findNotesByClient,
  findNotesByOrder,
  insertClientNote,
  insertOrderNote,
  findNoteWithOwner,
  deleteNoteById,
} from './note.model'

async function assertClientExists(businessId: string, clientId: string) {
  const client = await findClientById(businessId, clientId)

  if (!client) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }
}

async function assertOrderExists(businessId: string, orderId: string) {
  const order = await findOrderById(businessId, orderId)

  if (!order) {
    throw new AppError('Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }
}

export async function listNotesForClient(businessId: string, clientId: string) {
  await assertClientExists(businessId, clientId)

  return findNotesByClient(clientId)
}

export async function createNoteForClient(
  businessId: string,
  clientId: string,
  content: string,
  createdBy: string,
) {
  await assertClientExists(businessId, clientId)

  return insertClientNote(clientId, content, createdBy)
}

export async function listNotesForOrder(businessId: string, orderId: string) {
  await assertOrderExists(businessId, orderId)

  return findNotesByOrder(orderId)
}

export async function createNoteForOrder(
  businessId: string,
  orderId: string,
  content: string,
  createdBy: string,
) {
  await assertOrderExists(businessId, orderId)

  return insertOrderNote(orderId, content, createdBy)
}

export async function deleteNote(businessId: string, noteId: string) {
  const note = await findNoteWithOwner(noteId)
  const ownerBusinessId = note?.client?.businessId ?? note?.order?.businessId

  if (!note || ownerBusinessId !== businessId) {
    throw new AppError('Nota no encontrada', 404, 'NOTE_NOT_FOUND')
  }

  await deleteNoteById(noteId)
}

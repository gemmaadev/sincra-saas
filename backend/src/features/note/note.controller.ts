import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import {
  listNotesForClient,
  createNoteForClient,
  listNotesForOrder,
  createNoteForOrder,
  deleteNote,
} from './note.service'
import type { CreateNoteBody } from './note.types'

function assertValidContent(content: unknown) {
  if (typeof content !== 'string' || !content.trim()) {
    throw new AppError('La nota no puede estar vacía', 400, 'MISSING_CONTENT')
  }
}

export const listForClient = asyncHandler(async (req: Request, res: Response) => {
  const notes = await listNotesForClient(req.businessId!, req.params.clientId as string)
  res.json({ notes })
})

export const createForClient = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body as CreateNoteBody
  assertValidContent(content)

  const note = await createNoteForClient(
    req.businessId!,
    req.params.clientId as string,
    content,
    req.userId!,
  )
  res.status(201).json({ note })
})

export const listForOrder = asyncHandler(async (req: Request, res: Response) => {
  const notes = await listNotesForOrder(req.businessId!, req.params.orderId as string)
  res.json({ notes })
})

export const createForOrder = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body as CreateNoteBody
  assertValidContent(content)

  const note = await createNoteForOrder(
    req.businessId!,
    req.params.orderId as string,
    content,
    req.userId!,
  )
  res.status(201).json({ note })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteNote(req.businessId!, req.params.id as string)
  res.status(204).send()
})

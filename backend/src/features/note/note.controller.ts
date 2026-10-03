import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import { listNotesForClient, createNote, deleteNote } from './note.service'

interface CreateNoteBody {
  content: string
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const notes = await listNotesForClient(req.businessId!, req.params.clientId as string)
  res.json({ notes })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body as CreateNoteBody

  if (!content?.trim()) {
    throw new AppError('La nota no puede estar vacía', 400, 'MISSING_CONTENT')
  }

  const note = await createNote(
    req.businessId!,
    req.params.clientId as string,
    content,
    req.userId!,
  )
  res.status(201).json({ note })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteNote(req.businessId!, req.params.id as string)
  res.status(204).send()
})

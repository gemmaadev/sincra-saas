import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import { listTags, createTag, updateTag, deleteTag } from './tag.service'
import type { CreateTagInput, UpdateTagInput } from './tag.types'

const MAX_TAG_NAME_LENGTH = 30
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/
const TAG_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

function assertValidName(name: unknown) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new AppError('El nombre es obligatorio', 400, 'MISSING_FIELDS')
  }

  if (name.trim().length > MAX_TAG_NAME_LENGTH) {
    throw new AppError(
      `El nombre no puede superar los ${MAX_TAG_NAME_LENGTH} caracteres`,
      400,
      'INVALID_NAME',
    )
  }
}

function assertValidColor(color: string) {
  if (!HEX_COLOR_PATTERN.test(color)) {
    throw new AppError('El color debe tener el formato #RRGGBB', 400, 'INVALID_COLOR')
  }
}

function assertValidPriority(priority: string) {
  if (!TAG_PRIORITIES.includes(priority)) {
    throw new AppError('La prioridad no es válida', 400, 'INVALID_PRIORITY')
  }
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const tags = await listTags(req.businessId!)
  res.json({ tags })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, color, priority } = req.body as CreateTagInput

  if (typeof name !== 'string' || typeof color !== 'string') {
    throw new AppError('Faltan datos obligatorios', 400, 'MISSING_FIELDS')
  }

  assertValidName(name)
  assertValidColor(color)
  if (priority !== undefined) assertValidPriority(priority)

  const tag = await createTag(req.businessId!, req.userId!, {
    name: name.trim(),
    color,
    priority,
  })

  res.status(201).json({ tag })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { name, color, priority } = req.body as UpdateTagInput

  if (name === undefined && color === undefined && priority === undefined) {
    throw new AppError('No hay nada que actualizar', 400, 'MISSING_FIELDS')
  }

  if (name !== undefined) assertValidName(name)
  if (color !== undefined) assertValidColor(color)
  if (priority !== undefined) assertValidPriority(priority)

  const tag = await updateTag(req.businessId!, req.params.id as string, {
    name: name?.trim(),
    color,
    priority,
  })

  res.json({ tag })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteTag(req.businessId!, req.params.id as string)

  res.status(204).send()
})

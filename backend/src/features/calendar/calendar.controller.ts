import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import {
  listEvents,
  createEvent,
  updateEvent,
  rescheduleEvent,
  deleteEvent,
} from './calendar.service'
import type { CreateCalendarEventInput, UpdateCalendarEventInput } from './calendar.types'

function parseRequiredDate(value: unknown, fieldLabel: string): Date {
  const date = new Date(value as string)

  if (typeof value !== 'string' || !value || Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldLabel} no es una fecha válida`, 400, 'INVALID_DATE')
  }

  return date
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { dateFrom, dateTo } = req.query as { dateFrom?: string; dateTo?: string }

  if (!dateFrom || !dateTo) {
    throw new AppError('Indica el rango de fechas', 400, 'MISSING_DATE_RANGE')
  }

  const events = await listEvents(req.businessId!, { dateFrom, dateTo })

  res.json({ events })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, clientId, orderId } = req.body as CreateCalendarEventInput

  if (typeof title !== 'string' || !title.trim()) {
    throw new AppError('Indica el título del evento', 400, 'MISSING_TITLE')
  }

  const date = parseRequiredDate(req.body.date, 'La fecha')

  const event = await createEvent(req.businessId!, req.userId, {
    title: title.trim(),
    description,
    date,
    clientId,
    orderId,
  })

  res.status(201).json({ event })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, clientId, orderId } = req.body as UpdateCalendarEventInput

  if (title !== undefined && !title.trim()) {
    throw new AppError('Indica el título del evento', 400, 'MISSING_TITLE')
  }

  const date = req.body.date !== undefined ? parseRequiredDate(req.body.date, 'La fecha') : undefined

  const event = await updateEvent(req.businessId!, req.params.id as string, {
    title: title?.trim(),
    description,
    date,
    clientId,
    orderId,
  })

  res.json({ event })
})

export const reschedule = asyncHandler(async (req: Request, res: Response) => {
  const date = parseRequiredDate(req.body.date, 'La fecha')

  const event = await rescheduleEvent(req.businessId!, req.params.id as string, date)

  res.json({ event })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteEvent(req.businessId!, req.params.id as string)

  res.status(204).send()
})

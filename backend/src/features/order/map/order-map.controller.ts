import type { Request, Response } from 'express'
import { asyncHandler } from '../../../shared/handlers/asyncHandler'
import { AppError } from '../../../shared/AppError'
import { Channel } from '../../../generated/prisma/client'
import { getOrderMap } from './order-map.service'
import type { OrderMapFilters, OrderMapQuery } from './order-map.types'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const CHANNELS: string[] = Object.values(Channel)

function readText(value: unknown, name: string): string | undefined {
  if (value === undefined || value === '') return undefined

  if (typeof value !== 'string') {
    throw new AppError(`El parámetro ${name} no es válido`, 400, 'INVALID_QUERY')
  }

  return value
}

function parseDate(value: string | undefined, name: string, endOfDay: boolean): Date | undefined {
  if (value === undefined) return undefined

  const isDateOnly = DATE_ONLY_PATTERN.test(value)
  const date = new Date(isDateOnly && endOfDay ? `${value}T23:59:59.999Z` : value)

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`La fecha ${name} no es válida`, 400, 'INVALID_DATE')
  }

  return date
}

function parseMapFilters(query: OrderMapQuery): OrderMapFilters {
  const channel = readText(query.channel, 'channel')
  const from = parseDate(readText(query.from, 'from'), 'from', false)
  const to = parseDate(readText(query.to, 'to'), 'to', true)

  if (channel !== undefined && !CHANNELS.includes(channel)) {
    throw new AppError('El canal no es válido', 400, 'INVALID_CHANNEL')
  }

  if (from && to && from > to) {
    throw new AppError(
      'La fecha inicial no puede ser posterior a la final',
      400,
      'INVALID_DATE_RANGE',
    )
  }

  return { channel: channel as Channel | undefined, from, to }
}

export const getMap = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseMapFilters(req.query as OrderMapQuery)

  const orderMap = await getOrderMap(req.businessId!, filters)

  res.json(orderMap)
})

import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { getDashboard } from './stats.service'
import type { StatsFilters } from './stats.types'

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const { dateFrom, dateTo } = req.query as StatsFilters

  const result = await getDashboard(req.businessId!, { dateFrom, dateTo })

  res.json(result)
})

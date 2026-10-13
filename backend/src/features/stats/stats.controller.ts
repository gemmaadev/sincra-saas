import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { getOverview } from './stats.service'
import type { StatsFilters } from './stats.types'

export const overview = asyncHandler(async (req: Request, res: Response) => {
  const { dateFrom, dateTo } = req.query as StatsFilters

  const overview = await getOverview(req.businessId!, { dateFrom, dateTo })

  res.json({ overview })
})

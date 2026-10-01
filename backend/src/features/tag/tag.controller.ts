import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { listTags } from './tag.service'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const tags = await listTags(req.businessId!)
  res.json({ tags })
})

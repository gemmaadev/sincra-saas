import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import { inviteMember, acceptInvite, listBusinessMembers } from './team.service'

interface InviteBody {
  email: string
  name: string
}

export const invite = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body as InviteBody

  if (!email || !name) {
    throw new AppError('Faltan datos obligatorios', 400, 'MISSING_FIELDS')
  }

  await inviteMember(req.businessId!, email, name)
  res.status(201).json({ success: true })
})

interface AcceptInviteBody {
  token: string
  newPassword?: string
}

export const accept = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as AcceptInviteBody

  if (!token) {
    throw new AppError('Falta el token de invitación', 400, 'MISSING_FIELDS')
  }

  await acceptInvite(token, newPassword)
  res.json({ success: true })
})

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await listBusinessMembers(req.businessId!)
  res.json({ members })
})

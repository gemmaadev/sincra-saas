import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import {
  inviteMember,
  acceptInvite,
  listBusinessMembers,
  updateMemberStatus,
  resendInvite,
} from './team.service'
import type { InviteBody, AcceptInviteBody, UpdateMemberStatusBody } from './team.types'

export const invite = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body as InviteBody

  if (!email || !name) {
    throw new AppError('Faltan datos obligatorios', 400, 'MISSING_FIELDS')
  }

  await inviteMember(req.businessId!, email, name)
  res.status(201).json({ success: true })
})

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

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as UpdateMemberStatusBody

  if (status !== 'ACTIVE' && status !== 'INACTIVE') {
    throw new AppError('Estado no válido', 400, 'INVALID_STATUS')
  }

  await updateMemberStatus(req.businessId!, req.userId!, req.params.userId as string, status)
  res.json({ success: true })
})

export const resend = asyncHandler(async (req: Request, res: Response) => {
  await resendInvite(req.businessId!, req.params.userId as string)
  res.json({ success: true })
})

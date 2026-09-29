import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  type NotificationPrefs,
} from './user.service'

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getUserProfile(req.userId!, req.businessId!)
  res.json({ user: profile })
})

interface UpdateProfileBody {
  name?: string
  avatarUrl?: string
  phone?: string
  notificationPrefs?: NotificationPrefs
}

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, avatarUrl, phone, notificationPrefs } = req.body as UpdateProfileBody

  if (name !== undefined && name.trim().length < 2) {
    throw new AppError('El nombre es demasiado corto', 400, 'INVALID_NAME')
  }

  const profile = await updateUserProfile(req.userId!, req.businessId!, {
    name,
    avatarUrl,
    phone,
    notificationPrefs,
  })

  res.json({ user: profile })
})

interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
}

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as ChangePasswordBody

  if (!currentPassword || !newPassword) {
    throw new AppError('Faltan datos obligatorios', 400, 'MISSING_FIELDS')
  }

  if (newPassword.length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres', 400, 'INVALID_PASSWORD')
  }

  await changeUserPassword(req.userId!, currentPassword, newPassword)
  res.json({ success: true })
})

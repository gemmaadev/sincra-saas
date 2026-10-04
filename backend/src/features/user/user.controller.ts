import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  uploadUserAvatar,
} from './user.service'
import type { UpdateProfileInput, ChangePasswordBody } from './user.types'

const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new AppError('El archivo debe ser una imagen', 400, 'INVALID_FILE_TYPE'))
    }
    callback(null, true)
  },
})

export function uploadAvatarMiddleware(req: Request, res: Response, next: NextFunction) {
  avatarUpload.single('avatar')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('La imagen no puede superar los 2MB', 400, 'FILE_TOO_LARGE'))
    }
    if (error) return next(error)
    next()
  })
}

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getUserProfile(req.userId!, req.businessId!)
  res.json({ user: profile })
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, avatarUrl, phone, notificationPrefs } = req.body as UpdateProfileInput

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

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Falta el archivo de imagen', 400, 'MISSING_FILE')
  }

  const profile = await uploadUserAvatar(req.userId!, req.businessId!, req.file.buffer)
  res.json({ user: profile })
})

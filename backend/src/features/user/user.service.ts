import cloudinary from '../../config/cloudinary'
import { AppError } from '../../shared/AppError'
import { comparePassword, hashPassword } from '../../shared/hash'
import {
  findUserById,
  findActiveMembershipWithUser,
  updateUserAndMembership,
  updateMembershipAvatar,
  updateUserPasswordHash,
} from './user.model'
import type { MembershipWithUser, ProfileResponse, UpdateProfileInput } from './user.types'

function toProfileResponse(membership: MembershipWithUser): ProfileResponse {
  return {
    id: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.role,
    avatarUrl: membership.avatarUrl,
    phone: membership.phone,
    notificationPrefs: membership.user.notificationPrefs,
    createdAt: membership.createdAt,
  }
}

export async function getUserProfile(userId: string, businessId: string) {
  const membership = await findActiveMembershipWithUser(userId, businessId)

  if (!membership) {
    throw new AppError('Tu sesión ya no es válida', 401, 'UNAUTHORIZED')
  }

  return toProfileResponse(membership)
}

export async function updateUserProfile(
  userId: string,
  businessId: string,
  { name, avatarUrl, phone, notificationPrefs }: UpdateProfileInput,
) {
  const membership = await updateUserAndMembership(userId, businessId, {
    name,
    avatarUrl,
    phone,
    notificationPrefs,
  })

  return toProfileResponse(membership)
}

export async function uploadUserAvatar(userId: string, businessId: string, fileBuffer: Buffer) {
  const avatarUrl = await new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'sincra/avatars', resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error('No se pudo subir la imagen'))
        }
        resolve(result.secure_url)
      },
    )
    uploadStream.end(fileBuffer)
  })

  const membership = await updateMembershipAvatar(userId, businessId, avatarUrl)

  return toProfileResponse(membership)
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await findUserById(userId)

  if (!user || !user.passwordHash) {
    throw new AppError('No se pudo verificar tu contraseña actual', 400, 'NO_PASSWORD_SET')
  }

  const matches = await comparePassword(currentPassword, user.passwordHash)
  if (!matches) {
    throw new AppError('La contraseña actual no es correcta', 401, 'INVALID_PASSWORD')
  }

  const passwordHash = await hashPassword(newPassword)
  await updateUserPasswordHash(userId, passwordHash)
}

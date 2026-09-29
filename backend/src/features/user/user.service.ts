import prisma from '../../config/db'
import { AppError } from '../../shared/AppError'
import { comparePassword, hashPassword } from '../../shared/hash'
import type { Prisma } from '../../generated/prisma/client'

export interface NotificationPrefs {
  newOrders?: boolean
  unansweredCommunications?: boolean
  followUpTasks?: boolean
  weeklyDigest?: boolean
}

function toProfileResponse(membership: {
  role: string
  avatarUrl: string | null
  phone: string | null
  createdAt: Date
  user: { id: string; name: string; email: string; notificationPrefs: unknown }
}) {
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
  const membership = await prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
    include: { user: true },
  })

  if (!membership) {
    throw new AppError('Tu sesión ya no es válida', 401, 'UNAUTHORIZED')
  }

  return toProfileResponse(membership)
}

interface UpdateProfileInput {
  name?: string
  avatarUrl?: string
  phone?: string
  notificationPrefs?: NotificationPrefs
}

export async function updateUserProfile(
  userId: string,
  businessId: string,
  { name, avatarUrl, phone, notificationPrefs }: UpdateProfileInput,
) {
  const [, membership] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(notificationPrefs !== undefined && {
          notificationPrefs: notificationPrefs as Prisma.InputJsonValue,
        }),
      },
    }),
    prisma.businessMember.update({
      where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
      data: {
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(phone !== undefined && { phone }),
      },
      include: { user: true },
    }),
  ])

  return toProfileResponse(membership)
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user || !user.passwordHash) {
    throw new AppError('No se pudo verificar tu contraseña actual', 400, 'NO_PASSWORD_SET')
  }

  const matches = await comparePassword(currentPassword, user.passwordHash)
  if (!matches) {
    throw new AppError('La contraseña actual no es correcta', 401, 'INVALID_PASSWORD')
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
}

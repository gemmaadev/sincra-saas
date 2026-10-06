import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'
import type { UpdateProfileInput } from './user.types'

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } })
}

export async function insertUser(name: string, email: string) {
  return prisma.user.create({ data: { name, email } })
}

export async function findActiveMembershipWithUser(userId: string, businessId: string) {
  return prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
    include: { user: true },
  })
}

export async function updateUserAndMembership(
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

  return membership
}

export async function updateMembershipAvatar(userId: string, businessId: string, avatarUrl: string) {
  return prisma.businessMember.update({
    where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
    data: { avatarUrl },
    include: { user: true },
  })
}

export async function updateUserPasswordHash(userId: string, passwordHash: string) {
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
}

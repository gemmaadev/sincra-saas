import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'
import { DEFAULT_TAGS } from '../../shared/defaultTags'
import type { NewBusinessData, SocialProfile } from './auth.types'

const ACTIVE_MEMBERSHIPS_WITH_BUSINESS = {
  memberships: { where: { status: 'ACTIVE' }, include: { business: true } },
} satisfies Prisma.UserInclude

export async function findActiveMembershipsWithBusiness(userId: string) {
  return prisma.businessMember.findMany({
    where: { userId, status: 'ACTIVE' },
    include: { business: true },
  })
}

export async function findUserWithBusinesses(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: ACTIVE_MEMBERSHIPS_WITH_BUSINESS,
  })
}

export async function findActiveMembership(userId: string, businessId: string) {
  return prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
  })
}

export async function findActiveMembershipWithDetails(userId: string, businessId: string) {
  return prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
    include: { user: true, business: true },
  })
}

async function createBusinessWithAdminAndDefaultTags(
  transaction: Prisma.TransactionClient,
  userId: string,
  businessData: NewBusinessData,
) {
  const business = await transaction.business.create({
    data: { ...businessData, createdBy: userId },
  })

  const membership = await transaction.businessMember.create({
    data: { businessId: business.id, userId, role: 'ADMIN', status: 'ACTIVE' },
  })

  await transaction.tag.createMany({
    data: DEFAULT_TAGS.map((tag) => ({
      businessId: business.id,
      name: tag.name,
      color: tag.color,
      isDefault: true,
    })),
  })

  return { business, membership }
}

export async function createUserWithBusiness(
  userData: { name: string; email: string; passwordHash: string },
  businessData: NewBusinessData,
) {
  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({ data: userData })
    const { business, membership } = await createBusinessWithAdminAndDefaultTags(
      transaction,
      user.id,
      businessData,
    )

    return { user, business, membership }
  })
}

export async function createBusinessForUser(userId: string, businessData: NewBusinessData) {
  return prisma.$transaction((transaction) =>
    createBusinessWithAdminAndDefaultTags(transaction, userId, businessData),
  )
}

export async function updateUserSocialIds(
  userId: string,
  socialIds: { googleId?: string; microsoftId?: string },
) {
  return prisma.user.update({
    where: { id: userId },
    data: socialIds,
    include: ACTIVE_MEMBERSHIPS_WITH_BUSINESS,
  })
}

export async function createSocialUser(profile: SocialProfile) {
  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.googleId,
      microsoftId: profile.microsoftId,
    },
    include: ACTIVE_MEMBERSHIPS_WITH_BUSINESS,
  })
}

export async function invalidateUnusedResetTokens(userId: string) {
  await prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  })
}

export async function insertResetToken(token: string, userId: string, expiresAt: Date) {
  return prisma.passwordResetToken.create({ data: { token, userId, expiresAt } })
}

export async function findResetToken(token: string) {
  return prisma.passwordResetToken.findUnique({ where: { token } })
}

export async function applyPasswordReset(userId: string, resetTokenId: string, passwordHash: string) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetTokenId },
      data: { usedAt: new Date() },
    }),
  ])
}

export async function findBusinessCountry(businessId: string): Promise<string | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { country: true },
  })

  return business?.country ?? null
}

export async function findBusinessById(businessId: string) {
  return prisma.business.findUnique({ where: { id: businessId } })
}

export async function updateBusiness(businessId: string, data: Prisma.BusinessUpdateInput) {
  return prisma.business.update({ where: { id: businessId }, data })
}

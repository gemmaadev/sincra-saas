import bcrypt from 'bcrypt'
import prisma from '../../config/db'

const SALT_ROUNDS = 10

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash)
}

export async function getUserBusinesses(userId: string) {
  const memberships = await prisma.businessMember.findMany({
    where: { userId, status: 'ACTIVE' },
    include: { business: true },
  })

  return memberships.map((membership) => ({
    businessId: membership.business.id,
    name: membership.business.name,
    sector: membership.business.sector,
    role: membership.role,
  }))
}

export async function findUserWithBusinesses(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { business: true },
      },
    },
  })
}

export async function findMembership(userId: string, businessId: string) {
  return prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
  })
}

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

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findMembership(userId: string, businessId: string) {
  return prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
  })
}

interface RegisterInput {
  name: string
  email: string
  password: string
  businessName: string
  sector?: string
  description?: string
  country?: string
}

export async function registerBusinessOwner(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password)

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    })

    const business = await tx.business.create({
      data: {
        name: input.businessName,
        sector: input.sector,
        description: input.description,
        country: input.country ?? 'ES',
        createdBy: user.id,
      },
    })

    const membership = await tx.businessMember.create({
      data: {
        businessId: business.id,
        userId: user.id,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    return { user, business, membership }
  })
}

export async function findActiveMembershipWithDetails(userId: string, businessId: string) {
  return prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId }, status: 'ACTIVE' },
    include: { user: true, business: true },
  })
}

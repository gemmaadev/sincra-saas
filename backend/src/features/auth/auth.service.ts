import bcrypt from 'bcrypt'
import prisma from '../../config/db'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

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

// --- Login social (Google / Microsoft) ---

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function verifyGoogleToken(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload?.email) {
    throw new Error('Token de Google inválido')
  }

  return {
    email: payload.email,
    name: payload.name ?? payload.email,
    googleId: payload.sub,
  }
}

const msJwks = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
})

function getMicrosoftSigningKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  msJwks.getSigningKey(header.kid, (err, key) => {
    if (err || !key) return callback(err)
    callback(null, key.getPublicKey())
  })
}

export async function verifyMicrosoftToken(idToken: string) {
  const decoded = await new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(
      idToken,
      getMicrosoftSigningKey,
      { audience: process.env.MICROSOFT_CLIENT_ID },
      (err, payload) => {
        if (err || !payload || typeof payload === 'string')
          return reject(err ?? new Error('Token inválido'))
        resolve(payload)
      },
    )
  })

  const email = (decoded.email ?? decoded.preferred_username) as string | undefined
  if (!email) {
    throw new Error('Token de Microsoft inválido: sin email')
  }

  return {
    email,
    name: (decoded.name as string) ?? email,
    microsoftId: decoded.sub as string,
  }
}

interface SocialProfile {
  email: string
  name: string
  googleId?: string
  microsoftId?: string
}

export async function findOrCreateSocialUser(profile: SocialProfile) {
  const existing = await prisma.user.findUnique({
    where: { email: profile.email },
    include: { memberships: { where: { status: 'ACTIVE' }, include: { business: true } } },
  })

  if (existing) {
    const updateData: Record<string, string> = {}
    if (profile.googleId && !existing.googleId) updateData.googleId = profile.googleId
    if (profile.microsoftId && !existing.microsoftId) updateData.microsoftId = profile.microsoftId

    if (Object.keys(updateData).length > 0) {
      return prisma.user.update({
        where: { id: existing.id },
        data: updateData,
        include: { memberships: { where: { status: 'ACTIVE' }, include: { business: true } } },
      })
    }
    return existing
  }

  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.googleId,
      microsoftId: profile.microsoftId,
    },
    include: { memberships: { where: { status: 'ACTIVE' }, include: { business: true } } },
  })
}

interface OnboardingInput {
  businessName: string
  sector?: string
  description?: string
  country?: string
}

export async function completeOnboardingForUser(userId: string, input: OnboardingInput) {
  return prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name: input.businessName,
        sector: input.sector,
        description: input.description,
        country: input.country ?? 'ES',
        createdBy: userId,
      },
    })

    const membership = await tx.businessMember.create({
      data: {
        businessId: business.id,
        userId,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    return { business, membership }
  })
}

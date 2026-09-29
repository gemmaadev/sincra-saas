import prisma from '../../config/db'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Resend } from 'resend'
import { hashPassword } from '../../shared/hash'

const resend = new Resend(process.env.RESEND_API_KEY)

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

interface MicrosoftTokenResponse {
  id_token: string
}

export async function exchangeMicrosoftCode(code: string) {
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error('No se pudo intercambiar el código de Microsoft')
  }

  const { id_token: idToken } = (await response.json()) as MicrosoftTokenResponse
  const decoded = jwt.decode(idToken) as jwt.JwtPayload | null

  const email = (decoded?.email ?? decoded?.preferred_username) as string | undefined
  if (!email) {
    throw new Error('Token de Microsoft inválido: sin email')
  }

  return {
    email,
    name: (decoded?.name as string) ?? email,
    microsoftId: decoded?.sub as string,
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

// --- Password recovery ---

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Don't reveal whether the email exists (prevents user enumeration)
  if (!user || !user.passwordHash) {
    return
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Recupera tu contraseña de Sincra',
    html: `
      <p>Hola${user.name ? ` ${user.name}` : ''},</p>
      <p>Has solicitado restablecer tu contraseña en Sincra. Este enlace caduca en 1 hora:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Si no has sido tú, puedes ignorar este correo.</p>
    `,
  })
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken) {
    throw new Error('Token inválido')
  }

  if (resetToken.usedAt) {
    throw new Error('Este enlace ya se ha utilizado')
  }

  if (resetToken.expiresAt < new Date()) {
    throw new Error('Este enlace ha caducado')
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ])
}
export { hashPassword }

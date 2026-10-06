import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Resend } from 'resend'
import { hashPassword } from '../../shared/hash'
import * as userModel from '../user/user.model'
import * as authModel from './auth.model'
import type {
  RegisterInput,
  OnboardingInput,
  SocialProfile,
  GoogleUserInfoResponse,
  MicrosoftTokenResponse,
} from './auth.types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getUserBusinesses(userId: string) {
  const memberships = await authModel.findActiveMembershipsWithBusiness(userId)

  return memberships.map((membership) => ({
    businessId: membership.business.id,
    name: membership.business.name,
    sector: membership.business.sector,
    role: membership.role,
  }))
}

export async function findUserWithBusinesses(email: string) {
  return authModel.findUserWithBusinesses(email)
}

export async function findUserByEmail(email: string) {
  return userModel.findUserByEmail(email)
}

export async function findMembership(userId: string, businessId: string) {
  return authModel.findActiveMembership(userId, businessId)
}

export async function registerBusinessOwner(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password)

  return authModel.createUserWithBusiness(
    { name: input.name, email: input.email, passwordHash },
    {
      name: input.businessName,
      sector: input.sector,
      description: input.description,
      country: input.country ?? 'ES',
    },
  )
}

export async function findActiveMembershipWithDetails(userId: string, businessId: string) {
  return authModel.findActiveMembershipWithDetails(userId, businessId)
}

// --- Login social (Google / Microsoft) ---

export async function verifyGoogleAccessToken(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('No se pudo verificar el token de Google')
  }

  const payload = (await response.json()) as GoogleUserInfoResponse

  if (!payload.email || !payload.email_verified) {
    throw new Error('Google no ha verificado el email de esta cuenta')
  }

  return {
    email: payload.email,
    name: payload.name ?? payload.email,
    googleId: payload.sub,
  }
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

export async function findOrCreateSocialUser(profile: SocialProfile) {
  const existing = await authModel.findUserWithBusinesses(profile.email)

  if (existing) {
    const socialIdsToLink: { googleId?: string; microsoftId?: string } = {}
    if (profile.googleId && !existing.googleId) socialIdsToLink.googleId = profile.googleId
    if (profile.microsoftId && !existing.microsoftId) {
      socialIdsToLink.microsoftId = profile.microsoftId
    }

    if (Object.keys(socialIdsToLink).length > 0) {
      return authModel.updateUserSocialIds(existing.id, socialIdsToLink)
    }
    return existing
  }

  return authModel.createSocialUser(profile)
}

export async function completeOnboardingForUser(userId: string, input: OnboardingInput) {
  return authModel.createBusinessForUser(userId, {
    name: input.businessName,
    sector: input.sector,
    description: input.description,
    country: input.country ?? 'ES',
  })
}

// --- Password recovery ---

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes

export async function requestPasswordReset(email: string) {
  const user = await userModel.findUserByEmail(email)

  // Don't reveal whether the email exists (prevents user enumeration)
  if (!user || !user.passwordHash) {
    return
  }

  // Invalidate any previous unused tokens so only the latest one is redeemable
  await authModel.invalidateUnusedResetTokens(user.id)

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)

  await authModel.insertResetToken(token, user.id, expiresAt)

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Recupera tu contraseña de Sincra',
    html: `
      <p>Hola${user.name ? ` ${user.name}` : ''},</p>
      <p>Has solicitado restablecer tu contraseña en Sincra. Este enlace caduca en 15 minutos:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Si no has sido tú, puedes ignorar este correo.</p>
    `,
  })
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await authModel.findResetToken(token)

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

  await authModel.applyPasswordReset(resetToken.userId, resetToken.id, passwordHash)
}

import type { Prisma } from '../../generated/prisma/client'

export type UserWithMemberships = Prisma.UserGetPayload<{
  include: { memberships: { include: { business: true } } }
}>

export interface LoginBody {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  businessName: string
  sector?: string
  description?: string
  country?: string
}

export interface OnboardingInput {
  businessName: string
  sector?: string
  description?: string
  country?: string
}

export interface NewBusinessData {
  name: string
  sector?: string
  description?: string
  country: string
}

export interface SelectBusinessBody {
  businessId: string
}

export interface GoogleLoginBody {
  accessToken: string
}

export interface ForgotPasswordBody {
  email: string
}

export interface ResetPasswordBody {
  token: string
  newPassword: string
}

export interface GoogleUserInfoResponse {
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
}

export interface MicrosoftTokenResponse {
  id_token: string
}

export interface SocialProfile {
  email: string
  name: string
  googleId?: string
  microsoftId?: string
}

export interface SocialLoginResult {
  needsOnboarding: boolean
  needsBusinessSelection: boolean
  businesses?: { businessId: string; name: string; role: string }[]
}

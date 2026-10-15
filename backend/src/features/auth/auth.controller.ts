import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { signToken, signPendingToken, verifyPendingToken } from '../../shared/jwt'
import { AppError } from '../../shared/AppError'
import {
  getUserBusinesses,
  findUserWithBusinesses,
  findUserByEmail,
  findMembership,
  findActiveMembershipWithDetails,
  registerBusinessOwner,
  verifyGoogleAccessToken,
  exchangeMicrosoftCode,
  findOrCreateSocialUser,
  completeOnboardingForUser,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from './auth.service'
import { comparePassword } from '../../shared/hash'
import type {
  LoginBody,
  RegisterInput,
  OnboardingInput,
  SelectBusinessBody,
  SocialLoginResult,
  GoogleLoginBody,
  ForgotPasswordBody,
  ResetPasswordBody,
} from './auth.types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SESSION_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const PENDING_COOKIE_MAX_AGE_MS = 10 * 60 * 1000

function setTokenCookie(res: Response, token: string, maxAge: number) {
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge })
}

function setSessionCookie(res: Response, token: string) {
  setTokenCookie(res, token, SESSION_COOKIE_MAX_AGE_MS)
}

function setPendingCookie(res: Response, token: string) {
  setTokenCookie(res, token, PENDING_COOKIE_MAX_AGE_MS)
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginBody

  const user = await findUserWithBusinesses(email)

  if (!user || !user.passwordHash) {
    throw new AppError('Email o contraseña incorrectos', 401, 'INVALID_CREDENTIALS')
  }

  const passwordMatches = await comparePassword(password, user.passwordHash)

  if (!passwordMatches) {
    throw new AppError('Email o contraseña incorrectos', 401, 'INVALID_CREDENTIALS')
  }

  if (user.memberships.length === 0) {
    throw new AppError('Tu cuenta no pertenece a ningún negocio', 403, 'NO_BUSINESS')
  }

  if (user.memberships.length === 1) {
    const membership = user.memberships[0]
    const token = signToken({
      userId: user.id,
      businessId: membership.businessId,
      role: membership.role,
    })

    setSessionCookie(res, token)
    res.json({ needsBusinessSelection: false })
    return
  }

  const pendingToken = signPendingToken({ userId: user.id, pending: true })
  setPendingCookie(res, pendingToken)

  res.json({
    needsBusinessSelection: true,
    businesses: user.memberships.map((m) => ({
      businessId: m.businessId,
      name: m.business.name,
      role: m.role,
    })),
  })
})

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, businessName, sector, description, country } =
    req.body as RegisterInput

  if (!name || !email || !password || !businessName) {
    throw new AppError('Faltan datos obligatorios', 400, 'MISSING_FIELDS')
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('El email no tiene un formato válido', 400, 'INVALID_EMAIL')
  }

  if (password.length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres', 400, 'INVALID_PASSWORD')
  }

  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new AppError('Ya existe una cuenta con este email', 409, 'EMAIL_TAKEN')
  }

  const { user, business, membership } = await registerBusinessOwner({
    name,
    email,
    password,
    businessName,
    sector,
    description,
    country,
  })

  const token = signToken({
    userId: user.id,
    businessId: business.id,
    role: membership.role,
  })

  setSessionCookie(res, token)
  res.status(201).json({ success: true })
})

export const getMyBusinesses = asyncHandler(async (req: Request, res: Response) => {
  const businesses = await getUserBusinesses(req.userId!)
  res.json({ businesses })
})

export const selectBusiness = asyncHandler(async (req: Request, res: Response) => {
  const { businessId } = req.body as SelectBusinessBody
  const pendingToken = req.cookies?.token

  if (!pendingToken) {
    throw new AppError('No has iniciado sesión', 401, 'UNAUTHORIZED')
  }

  let userId: string
  try {
    const payload = verifyPendingToken(pendingToken)
    userId = payload.userId
  } catch {
    throw new AppError('Sesión no válida o expirada', 401, 'UNAUTHORIZED')
  }

  const membership = await findMembership(userId, businessId)

  if (!membership) {
    throw new AppError('No perteneces a ese negocio', 403, 'FORBIDDEN')
  }

  const token = signToken({
    userId,
    businessId: membership.businessId,
    role: membership.role,
  })

  setSessionCookie(res, token)
  res.json({ success: true })
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' })
  res.json({ success: true })
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  const membership = await findActiveMembershipWithDetails(req.userId!, req.businessId!)

  if (!membership) {
    throw new AppError('Tu sesión ya no es válida', 401, 'UNAUTHORIZED')
  }

  res.json({
    user: {
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
    },
    business: {
      id: membership.business.id,
      name: membership.business.name,
    },
    role: membership.role,
  })
})

//Social login

async function resolveSocialLogin(
  res: Response,
  profile: { email: string; name: string; googleId?: string; microsoftId?: string },
): Promise<SocialLoginResult> {
  const user = await findOrCreateSocialUser(profile)

  if (user.memberships.length === 0) {
    const pendingToken = signPendingToken({ userId: user.id, pending: true })
    setPendingCookie(res, pendingToken)
    return { needsOnboarding: true, needsBusinessSelection: false }
  }

  if (user.memberships.length === 1) {
    const membership = user.memberships[0]
    const token = signToken({
      userId: user.id,
      businessId: membership.businessId,
      role: membership.role,
    })
    setSessionCookie(res, token)
    return { needsOnboarding: false, needsBusinessSelection: false }
  }

  const pendingToken = signPendingToken({ userId: user.id, pending: true })
  setPendingCookie(res, pendingToken)
  return {
    needsOnboarding: false,
    needsBusinessSelection: true,
    businesses: user.memberships.map((m) => ({
      businessId: m.businessId,
      name: m.business.name,
      role: m.role,
    })),
  }
}

async function handleSocialLogin(
  res: Response,
  profile: { email: string; name: string; googleId?: string; microsoftId?: string },
) {
  const result = await resolveSocialLogin(res, profile)
  res.json(result)
}

function socialLoginRedirectPath(result: SocialLoginResult): string {
  if (result.needsOnboarding) return '/onboarding'
  if (result.needsBusinessSelection) return '/select-business'
  return '/stats'
}

export const loginWithGoogle = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken } = req.body as GoogleLoginBody

  if (!accessToken) {
    throw new AppError('Falta el token de Google', 400, 'MISSING_TOKEN')
  }

  let profile
  try {
    profile = await verifyGoogleAccessToken(accessToken)
  } catch {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  await handleSocialLogin(res, profile)
})

//Onboarding after social login without business

export const completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const { businessName, sector, description, country } = req.body as OnboardingInput
  const pendingToken = req.cookies?.token

  if (!pendingToken) {
    throw new AppError('No has iniciado sesión', 401, 'UNAUTHORIZED')
  }

  let userId: string
  try {
    const payload = verifyPendingToken(pendingToken)
    userId = payload.userId
  } catch {
    throw new AppError('Sesión no válida o expirada', 401, 'UNAUTHORIZED')
  }

  if (!businessName) {
    throw new AppError('Falta el nombre del negocio', 400, 'MISSING_FIELDS')
  }

  const { business, membership } = await completeOnboardingForUser(userId, {
    businessName,
    sector,
    description,
    country,
  })

  const token = signToken({
    userId,
    businessId: business.id,
    role: membership.role,
  })

  setSessionCookie(res, token)
  res.json({ success: true })
})

// Login with Microsoft via redirect (BFF: backend communicates with Microsoft, not the browser)

export const startMicrosoftAuth = asyncHandler(async (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
    response_mode: 'query',
    scope: 'openid profile email',
  })

  res.redirect(
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
  )
})

export const microsoftCallback = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    error,
    error_description: errorDescription,
  } = req.query as {
    code?: string
    error?: string
    error_description?: string
  }

  if (!code) {
    console.error('Microsoft no devolvió código de autorización:', { error, errorDescription })
    throw new AppError('Falta el código de autorización de Microsoft', 400, 'MISSING_CODE')
  }

  let profile
  try {
    profile = await exchangeMicrosoftCode(code)
  } catch {
    throw new AppError(
      'No se pudo verificar el inicio de sesión con Microsoft',
      401,
      'INVALID_TOKEN',
    )
  }

  const result = await resolveSocialLogin(res, profile)
  res.redirect(`${process.env.FRONTEND_URL}${socialLoginRedirectPath(result)}`)
})

// --- Password recovery ---

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordBody

  if (!email) {
    throw new AppError('El email es obligatorio', 400, 'MISSING_FIELDS')
  }

  try {
    await requestPasswordReset(email)
  } catch (error) {
    // Don't leak provider errors (e.g. Resend sandbox restrictions) to the client
    console.error('Error sending password reset email:', error)
  }

  // Always respond the same way, whether or not the email exists
  res.json({ success: true })
})

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as ResetPasswordBody

  if (!token || !newPassword) {
    throw new AppError('Faltan datos obligatorios', 400, 'MISSING_FIELDS')
  }

  if (newPassword.length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres', 400, 'INVALID_PASSWORD')
  }

  try {
    await resetPasswordService(token, newPassword)
  } catch (error) {
    throw new AppError(
      error instanceof Error ? error.message : 'No se pudo restablecer la contraseña',
      400,
      'INVALID_TOKEN',
    )
  }

  res.json({ success: true })
})

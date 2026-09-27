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
  comparePassword,
  registerBusinessOwner,
  verifyGoogleToken,
  verifyMicrosoftToken,
  findOrCreateSocialUser,
  completeOnboardingForUser,
} from './auth.service'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LoginBody {
  email: string
  password: string
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

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.json({ needsBusinessSelection: false })
    return
  }

  const pendingToken = signPendingToken({ userId: user.id, pending: true })
  res.cookie('token', pendingToken, { httpOnly: true, maxAge: 10 * 60 * 1000 })

  res.json({
    needsBusinessSelection: true,
    businesses: user.memberships.map((m) => ({
      businessId: m.businessId,
      name: m.business.name,
      role: m.role,
    })),
  })
})

interface RegisterBody {
  name: string
  email: string
  password: string
  businessName: string
  sector?: string
  description?: string
  country?: string
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, businessName, sector, description, country } =
    req.body as RegisterBody

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

  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.status(201).json({ success: true })
})

export const getMyBusinesses = asyncHandler(async (req: Request, res: Response) => {
  const businesses = await getUserBusinesses(req.userId!)
  res.json({ businesses })
})

interface SelectBusinessBody {
  businessId: string
}

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

  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ success: true })
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('token')
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

// --- Login social ---

async function handleSocialLogin(
  res: Response,
  profile: { email: string; name: string; googleId?: string; microsoftId?: string },
) {
  const user = await findOrCreateSocialUser(profile)

  if (user.memberships.length === 0) {
    const pendingToken = signPendingToken({ userId: user.id, pending: true })
    res.cookie('token', pendingToken, { httpOnly: true, maxAge: 10 * 60 * 1000 })
    res.json({ needsOnboarding: true, needsBusinessSelection: false })
    return
  }

  if (user.memberships.length === 1) {
    const membership = user.memberships[0]
    const token = signToken({
      userId: user.id,
      businessId: membership.businessId,
      role: membership.role,
    })
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.json({ needsOnboarding: false, needsBusinessSelection: false })
    return
  }

  const pendingToken = signPendingToken({ userId: user.id, pending: true })
  res.cookie('token', pendingToken, { httpOnly: true, maxAge: 10 * 60 * 1000 })
  res.json({
    needsOnboarding: false,
    needsBusinessSelection: true,
    businesses: user.memberships.map((m) => ({
      businessId: m.businessId,
      name: m.business.name,
      role: m.role,
    })),
  })
}

interface SocialLoginBody {
  idToken: string
}

export const loginWithGoogle = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body as SocialLoginBody

  if (!idToken) {
    throw new AppError('Falta el token de Google', 400, 'MISSING_TOKEN')
  }

  let profile
  try {
    profile = await verifyGoogleToken(idToken)
  } catch {
    throw new AppError('No se pudo verificar el token de Google', 401, 'INVALID_TOKEN')
  }

  await handleSocialLogin(res, profile)
})

export const loginWithMicrosoft = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body as SocialLoginBody

  if (!idToken) {
    throw new AppError('Falta el token de Microsoft', 400, 'MISSING_TOKEN')
  }

  let profile
  try {
    profile = await verifyMicrosoftToken(idToken)
  } catch {
    throw new AppError('No se pudo verificar el token de Microsoft', 401, 'INVALID_TOKEN')
  }

  await handleSocialLogin(res, profile)
})

// --- Onboarding tras login social sin negocio ---

interface OnboardingBody {
  businessName: string
  sector?: string
  description?: string
  country?: string
}

export const completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const { businessName, sector, description, country } = req.body as OnboardingBody
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

  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ success: true })
})

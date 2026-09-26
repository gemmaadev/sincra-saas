import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { signToken, signPendingToken, verifyPendingToken } from '../../shared/jwt'
import { AppError } from '../../shared/AppError'
import {
  getUserBusinesses,
  findUserWithBusinesses,
  findUserByEmail,
  findMembership,
  comparePassword,
  registerBusinessOwner,
} from './auth.service'

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

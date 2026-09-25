import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  businessId: string
  role: 'ADMIN' | 'EMPLOYEE'
}

interface PendingTokenPayload {
  userId: string
  pending: true
}

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno')
}

const secret: string = JWT_SECRET

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function signPendingToken(payload: PendingTokenPayload): string {
  return jwt.sign(payload, secret, { expiresIn: '10m' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, secret) as TokenPayload
}

export function verifyPendingToken(token: string): PendingTokenPayload {
  return jwt.verify(token, secret) as PendingTokenPayload
}

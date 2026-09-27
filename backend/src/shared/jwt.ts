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

function isTokenPayload(payload: unknown): payload is TokenPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as TokenPayload).userId === 'string' &&
    typeof (payload as TokenPayload).businessId === 'string' &&
    ((payload as TokenPayload).role === 'ADMIN' || (payload as TokenPayload).role === 'EMPLOYEE')
  )
}

function isPendingTokenPayload(payload: unknown): payload is PendingTokenPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as PendingTokenPayload).userId === 'string' &&
    (payload as PendingTokenPayload).pending === true
  )
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, secret)
  if (!isTokenPayload(decoded)) {
    throw new Error('Token inválido: no es una sesión completa')
  }
  return decoded
}

export function verifyPendingToken(token: string): PendingTokenPayload {
  const decoded = jwt.verify(token, secret)
  if (!isPendingTokenPayload(decoded)) {
    throw new Error('Token inválido: no es un token pendiente')
  }
  return decoded
}

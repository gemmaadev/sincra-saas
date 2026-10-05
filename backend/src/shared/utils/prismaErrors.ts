import { Prisma } from '../../generated/prisma/client'

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002'

export function getUniqueViolationFields(error: unknown): string[] | null {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== UNIQUE_CONSTRAINT_ERROR_CODE
  ) {
    return null
  }

  const target = error.meta?.target
  return Array.isArray(target) ? target.map(String) : [String(target ?? '')]
}

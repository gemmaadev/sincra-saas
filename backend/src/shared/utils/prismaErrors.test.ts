import { describe, it, expect } from 'vitest'
import { Prisma } from '../../generated/prisma/client'
import { getUniqueViolationFields } from './prismaErrors'

function prismaError(code: string, target?: unknown) {
  return new Prisma.PrismaClientKnownRequestError('error', {
    code,
    clientVersion: 'test',
    meta: target === undefined ? undefined : { target },
  })
}

describe('getUniqueViolationFields', () => {
  // Given a unique constraint error with the violated columns
  // When the fields are extracted
  // Then they should be returned as a list
  it('returns the violated fields of a unique constraint error', () => {
    expect(getUniqueViolationFields(prismaError('P2002', ['businessId', 'email']))).toEqual([
      'businessId',
      'email',
    ])
  })

  // Given a unique constraint error whose target is an index name
  // When the fields are extracted
  // Then the name should be returned as a single item
  it('accepts a target given as an index name', () => {
    expect(getUniqueViolationFields(prismaError('P2002', 'Client_businessId_phone_key'))).toEqual([
      'Client_businessId_phone_key',
    ])
  })

  // Given a Prisma error that is not a unique violation
  // When the fields are extracted
  // Then null should be returned
  it('returns null for other Prisma errors', () => {
    expect(getUniqueViolationFields(prismaError('P2025'))).toBeNull()
  })

  // Given an error that does not come from Prisma
  // When the fields are extracted
  // Then null should be returned
  it('returns null for unknown errors', () => {
    expect(getUniqueViolationFields(new Error('boom'))).toBeNull()
  })
})

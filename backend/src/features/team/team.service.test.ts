import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import prisma from '../../config/db'
import * as hash from '../../shared/hash'
import { signInvitationToken } from '../../shared/jwt'
import { inviteMember, acceptInvite, listBusinessMembers } from './team.service'

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn().mockResolvedValue({ data: {}, error: null }),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

vi.mock('../../config/db', () => ({
  default: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    businessMember: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('../../shared/hash', () => ({
  hashPassword: vi.fn(),
}))

describe('inviteMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an email that doesn't belong to any existing user
  // When inviting them to a business
  // Then it should create a new pending User + BusinessMember and email the invite link
  it('creates a new user and a pending membership, then sends the invite email', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'user-new' } as never)
    vi.mocked(prisma.businessMember.create).mockResolvedValue({} as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await inviteMember('biz-1', 'nuevo@test.com', 'Nuevo Empleado')

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { name: 'Nuevo Empleado', email: 'nuevo@test.com' },
    })
    expect(prisma.businessMember.create).toHaveBeenCalledWith({
      data: { businessId: 'biz-1', userId: 'user-new', role: 'EMPLOYEE', status: 'PENDING' },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-new' },
      data: { invitationCode: expect.any(String) },
    })
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'nuevo@test.com' }),
    )
  })

  // Given an email that already belongs to a user, but not a member of this business
  // When inviting them
  // Then it should reuse the existing user instead of creating a duplicate
  it('reuses an existing user who is not yet a member of this business', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-existing' } as never)
    vi.mocked(prisma.businessMember.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.businessMember.create).mockResolvedValue({} as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await inviteMember('biz-1', 'existente@test.com', 'Existente')

    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(prisma.businessMember.create).toHaveBeenCalledWith({
      data: { businessId: 'biz-1', userId: 'user-existing', role: 'EMPLOYEE', status: 'PENDING' },
    })
  })

  // Given an email that already belongs to an active/pending member of this same business
  // When inviting them again
  // Then it should throw a 409 AppError instead of creating a duplicate membership
  it('throws a 409 AppError when the user already belongs to this business', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-existing' } as never)
    vi.mocked(prisma.businessMember.findUnique).mockResolvedValue({ id: 'membership-1' } as never)

    await expect(inviteMember('biz-1', 'existente@test.com', 'Existente')).rejects.toMatchObject({
      statusCode: 409,
      code: 'ALREADY_MEMBER',
    })
    expect(prisma.businessMember.create).not.toHaveBeenCalled()
  })
})

describe('acceptInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.$transaction as unknown as Mock).mockImplementation((ops: unknown[]) =>
      Promise.all(ops as Promise<unknown>[]),
    )
  })

  // Given a valid, unused invitation token and a new password
  // When accepting the invite
  // Then it should hash the password, clear the invitation code and activate the membership
  it('accepts a valid invitation and activates the membership', async () => {
    const token = signInvitationToken({ userId: 'user-1', businessId: 'biz-1', invite: true })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      invitationCode: token,
    } as never)
    vi.mocked(hash.hashPassword).mockResolvedValue('hashed-password')
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    vi.mocked(prisma.businessMember.update).mockResolvedValue({} as never)

    await acceptInvite(token, 'nuevaPassword123')

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { invitationCode: null, passwordHash: 'hashed-password' },
    })
    expect(prisma.businessMember.update).toHaveBeenCalledWith({
      where: { businessId_userId: { businessId: 'biz-1', userId: 'user-1' } },
      data: { status: 'ACTIVE' },
    })
  })

  // Given a token that has already been used (the stored invitationCode no longer matches)
  // When trying to accept it again
  // Then it should throw a 401 AppError instead of re-activating the membership
  it('throws a 401 AppError when the invitation was already used', async () => {
    const token = signInvitationToken({ userId: 'user-1', businessId: 'biz-1', invite: true })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      invitationCode: null,
    } as never)

    await expect(acceptInvite(token, 'nuevaPassword123')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
    })
    expect(prisma.businessMember.update).not.toHaveBeenCalled()
  })

  // Given a token signed with an already-past expiration
  // When trying to accept it
  // Then it should throw a 401 AppError
  it('throws a 401 AppError when the invitation token has expired', async () => {
    const jwt = await import('jsonwebtoken')
    const expiredToken = jwt.sign(
      { userId: 'user-1', businessId: 'biz-1', invite: true },
      process.env.JWT_SECRET!,
      { expiresIn: '-1s' },
    )

    await expect(acceptInvite(expiredToken, 'nuevaPassword123')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
    })
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })
})

describe('listBusinessMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business with active and pending members
  // When listing its members
  // Then it should return the mapped list from the memberships
  it('returns the mapped members of the business', async () => {
    vi.mocked(prisma.businessMember.findMany).mockResolvedValue([
      {
        role: 'ADMIN',
        status: 'ACTIVE',
        user: { id: 'user-1', name: 'Laura', email: 'laura@test.com' },
      },
      {
        role: 'EMPLOYEE',
        status: 'PENDING',
        user: { id: 'user-2', name: 'Nuevo', email: 'nuevo@test.com' },
      },
    ] as never)

    const members = await listBusinessMembers('biz-1')

    expect(prisma.businessMember.findMany).toHaveBeenCalledWith({
      where: { businessId: 'biz-1' },
      include: { user: true },
    })
    expect(members).toEqual([
      { id: 'user-1', name: 'Laura', email: 'laura@test.com', role: 'ADMIN', status: 'ACTIVE' },
      { id: 'user-2', name: 'Nuevo', email: 'nuevo@test.com', role: 'EMPLOYEE', status: 'PENDING' },
    ])
  })
})

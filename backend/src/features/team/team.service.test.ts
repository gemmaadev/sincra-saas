import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as userModel from '../user/user.model'
import * as teamModel from './team.model'
import * as hash from '../../shared/hash'
import { signInvitationToken } from '../../shared/jwt'
import { inviteMember, acceptInvite, listBusinessMembers, updateMemberStatus } from './team.service'

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn().mockResolvedValue({ data: {}, error: null }),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

vi.mock('../user/user.model')
vi.mock('./team.model')

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
    vi.mocked(userModel.findUserByEmail).mockResolvedValue(null)
    vi.mocked(userModel.insertUser).mockResolvedValue({ id: 'user-new' } as never)

    await inviteMember('biz-1', 'nuevo@test.com', 'Nuevo Empleado')

    expect(userModel.insertUser).toHaveBeenCalledWith('Nuevo Empleado', 'nuevo@test.com')
    expect(teamModel.insertPendingEmployee).toHaveBeenCalledWith('biz-1', 'user-new')
    expect(teamModel.setInvitationCode).toHaveBeenCalledWith('user-new', expect.any(String))
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'nuevo@test.com' }),
    )
  })

  // Given an email that already belongs to a user, but not a member of this business
  // When inviting them
  // Then it should reuse the existing user instead of creating a duplicate
  it('reuses an existing user who is not yet a member of this business', async () => {
    vi.mocked(userModel.findUserByEmail).mockResolvedValue({ id: 'user-existing' } as never)
    vi.mocked(teamModel.findMembership).mockResolvedValue(null)

    await inviteMember('biz-1', 'existente@test.com', 'Existente')

    expect(userModel.insertUser).not.toHaveBeenCalled()
    expect(teamModel.insertPendingEmployee).toHaveBeenCalledWith('biz-1', 'user-existing')
  })

  // Given an email that already belongs to an active/pending member of this same business
  // When inviting them again
  // Then it should throw a 409 AppError instead of creating a duplicate membership
  it('throws a 409 AppError when the user already belongs to this business', async () => {
    vi.mocked(userModel.findUserByEmail).mockResolvedValue({ id: 'user-existing' } as never)
    vi.mocked(teamModel.findMembership).mockResolvedValue({ id: 'membership-1' } as never)

    await expect(inviteMember('biz-1', 'existente@test.com', 'Existente')).rejects.toMatchObject({
      statusCode: 409,
      code: 'ALREADY_MEMBER',
    })
    expect(teamModel.insertPendingEmployee).not.toHaveBeenCalled()
  })
})

describe('acceptInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a valid, unused invitation token and a new password
  // When accepting the invite
  // Then it should hash the password, clear the invitation code and activate the membership
  it('accepts a valid invitation and activates the membership', async () => {
    const token = signInvitationToken({ userId: 'user-1', businessId: 'biz-1', invite: true })
    vi.mocked(userModel.findUserById).mockResolvedValue({
      id: 'user-1',
      invitationCode: token,
    } as never)
    vi.mocked(hash.hashPassword).mockResolvedValue('hashed-password')

    await acceptInvite(token, 'nuevaPassword123')

    expect(teamModel.activateInvitedMember).toHaveBeenCalledWith('user-1', 'biz-1', 'hashed-password')
  })

  // Given a token that has already been used (the stored invitationCode no longer matches)
  // When trying to accept it again
  // Then it should throw a 401 AppError instead of re-activating the membership
  it('throws a 401 AppError when the invitation was already used', async () => {
    const token = signInvitationToken({ userId: 'user-1', businessId: 'biz-1', invite: true })
    vi.mocked(userModel.findUserById).mockResolvedValue({
      id: 'user-1',
      invitationCode: null,
    } as never)

    await expect(acceptInvite(token, 'nuevaPassword123')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
    })
    expect(teamModel.activateInvitedMember).not.toHaveBeenCalled()
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
    expect(userModel.findUserById).not.toHaveBeenCalled()
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
    vi.mocked(teamModel.findMembersWithUser).mockResolvedValue([
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

    expect(teamModel.findMembersWithUser).toHaveBeenCalledWith('biz-1')
    expect(members).toEqual([
      { id: 'user-1', name: 'Laura', email: 'laura@test.com', role: 'ADMIN', status: 'ACTIVE' },
      { id: 'user-2', name: 'Nuevo', email: 'nuevo@test.com', role: 'EMPLOYEE', status: 'PENDING' },
    ])
  })
})

describe('updateMemberStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an admin deactivating a different member (an employee)
  // When updating their status
  // Then it should update the membership without checking the admin count
  it('lets an admin deactivate an employee', async () => {
    vi.mocked(teamModel.findMembership).mockResolvedValue({ role: 'EMPLOYEE' } as never)

    await updateMemberStatus('biz-1', 'admin-1', 'emp-1', 'INACTIVE')

    expect(teamModel.countAdminMembers).not.toHaveBeenCalled()
    expect(teamModel.updateMemberStatus).toHaveBeenCalledWith('biz-1', 'emp-1', 'INACTIVE')
  })

  // Given the target membership doesn't exist in this business
  // When trying to update its status
  // Then it should throw a 404 AppError instead of updating anything
  it('throws a 404 AppError when the member does not belong to this business', async () => {
    vi.mocked(teamModel.findMembership).mockResolvedValue(null)

    await expect(updateMemberStatus('biz-1', 'admin-1', 'ghost-1', 'INACTIVE')).rejects.toMatchObject(
      { statusCode: 404, code: 'TEAM_MEMBER_NOT_FOUND' },
    )
    expect(teamModel.updateMemberStatus).not.toHaveBeenCalled()
  })

  // Given an admin trying to deactivate themselves while being the only admin of the business
  // When updating their own status to INACTIVE
  // Then it should throw a 400 AppError and never touch the membership
  it('blocks an admin from deactivating themselves when they are the only admin', async () => {
    vi.mocked(teamModel.findMembership).mockResolvedValue({ role: 'ADMIN' } as never)
    vi.mocked(teamModel.countAdminMembers).mockResolvedValue(1)

    await expect(updateMemberStatus('biz-1', 'admin-1', 'admin-1', 'INACTIVE')).rejects.toMatchObject(
      { statusCode: 400, code: 'LAST_ADMIN' },
    )
    expect(teamModel.updateMemberStatus).not.toHaveBeenCalled()
  })

  // Given an admin deactivating themselves while another admin also exists
  // When updating their own status to INACTIVE
  // Then it should be allowed, since the business keeps at least one admin
  it('lets an admin deactivate themselves when another admin exists', async () => {
    vi.mocked(teamModel.findMembership).mockResolvedValue({ role: 'ADMIN' } as never)
    vi.mocked(teamModel.countAdminMembers).mockResolvedValue(2)

    await updateMemberStatus('biz-1', 'admin-1', 'admin-1', 'INACTIVE')

    expect(teamModel.updateMemberStatus).toHaveBeenCalledWith('biz-1', 'admin-1', 'INACTIVE')
  })

  // Given an admin reactivating a previously deactivated employee
  // When updating their status to ACTIVE
  // Then it should update the membership without any admin-count check
  it('lets an admin reactivate a member', async () => {
    vi.mocked(teamModel.findMembership).mockResolvedValue({ role: 'EMPLOYEE' } as never)

    await updateMemberStatus('biz-1', 'admin-1', 'emp-1', 'ACTIVE')

    expect(teamModel.countAdminMembers).not.toHaveBeenCalled()
    expect(teamModel.updateMemberStatus).toHaveBeenCalledWith('biz-1', 'emp-1', 'ACTIVE')
  })
})

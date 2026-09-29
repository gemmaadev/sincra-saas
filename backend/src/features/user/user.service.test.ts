import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import prisma from '../../config/db'
import * as hash from '../../shared/hash'
import { getUserProfile, updateUserProfile, changeUserPassword } from './user.service'

vi.mock('../../config/db', () => ({
  default: {
    user: { update: vi.fn(), findUnique: vi.fn() },
    businessMember: { update: vi.fn(), findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('../../shared/hash', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}))

describe('getUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an active membership for that user/business
  // When fetching the profile
  // Then it should return the mapped profile
  it('returns the mapped profile when the membership exists and is active', async () => {
    vi.mocked(prisma.businessMember.findUnique).mockResolvedValue({
      role: 'ADMIN',
      avatarUrl: 'https://cdn.test/avatar.png',
      phone: '+34600123456',
      createdAt: new Date('2026-01-01'),
      user: {
        id: 'user-1',
        name: 'Laura',
        email: 'laura@test.com',
        notificationPrefs: { newOrders: true },
      },
    } as never)

    const profile = await getUserProfile('user-1', 'biz-1')

    expect(prisma.businessMember.findUnique).toHaveBeenCalledWith({
      where: { businessId_userId: { businessId: 'biz-1', userId: 'user-1' }, status: 'ACTIVE' },
      include: { user: true },
    })
    expect(profile).toEqual({
      id: 'user-1',
      name: 'Laura',
      email: 'laura@test.com',
      role: 'ADMIN',
      avatarUrl: 'https://cdn.test/avatar.png',
      phone: '+34600123456',
      notificationPrefs: { newOrders: true },
      createdAt: new Date('2026-01-01'),
    })
  })

  // Given no active membership for that user/business (e.g. removed from the team)
  // When fetching the profile
  // Then it should throw a 401 AppError
  it('throws a 401 AppError when there is no active membership', async () => {
    vi.mocked(prisma.businessMember.findUnique).mockResolvedValue(null)

    await expect(getUserProfile('user-1', 'biz-1')).rejects.toMatchObject({ statusCode: 401 })
  })
})

describe('updateUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.$transaction as unknown as Mock).mockImplementation((ops: unknown[]) =>
      Promise.all(ops as Promise<unknown>[]),
    )
  })

  // Given only "name" is provided
  // When updating the profile
  // Then the User update should only touch `name`, and BusinessMember shouldn't be touched at all
  it('only updates the fields that were actually provided', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    vi.mocked(prisma.businessMember.update).mockResolvedValue({
      role: 'ADMIN',
      avatarUrl: null,
      phone: null,
      createdAt: new Date('2026-01-01'),
      user: {
        id: 'user-1',
        name: 'Nuevo Nombre',
        email: 'laura@test.com',
        notificationPrefs: null,
      },
    } as never)

    await updateUserProfile('user-1', 'biz-1', { name: 'Nuevo Nombre' })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { name: 'Nuevo Nombre' },
    })
    expect(prisma.businessMember.update).toHaveBeenCalledWith({
      where: { businessId_userId: { businessId: 'biz-1', userId: 'user-1' }, status: 'ACTIVE' },
      data: {},
      include: { user: true },
    })
  })

  // Given only "avatarUrl" is provided
  // When updating the profile
  // Then the User update should be a no-op, and BusinessMember should only touch avatarUrl
  it('does not touch name or notificationPrefs when only avatarUrl changes', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    vi.mocked(prisma.businessMember.update).mockResolvedValue({
      role: 'ADMIN',
      avatarUrl: 'https://cdn.test/new.png',
      phone: null,
      createdAt: new Date('2026-01-01'),
      user: { id: 'user-1', name: 'Laura', email: 'laura@test.com', notificationPrefs: null },
    } as never)

    await updateUserProfile('user-1', 'biz-1', { avatarUrl: 'https://cdn.test/new.png' })

    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: {} })
    expect(prisma.businessMember.update).toHaveBeenCalledWith({
      where: { businessId_userId: { businessId: 'biz-1', userId: 'user-1' }, status: 'ACTIVE' },
      data: { avatarUrl: 'https://cdn.test/new.png' },
      include: { user: true },
    })
  })
})

describe('changeUserPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a user with a password set and a correct current password
  // When changing the password
  // Then it should hash the new password and update the user
  it('hashes and stores the new password when the current one is correct', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hash-actual',
    } as never)
    vi.mocked(hash.comparePassword).mockResolvedValue(true)
    vi.mocked(hash.hashPassword).mockResolvedValue('hash-nuevo')
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await changeUserPassword('user-1', 'actual123', 'nueva12345')

    expect(hash.comparePassword).toHaveBeenCalledWith('actual123', 'hash-actual')
    expect(hash.hashPassword).toHaveBeenCalledWith('nueva12345')
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'hash-nuevo' },
    })
  })

  // Given the current password does not match the stored hash
  // When trying to change the password
  // Then it should throw a 401 AppError and never touch the database
  it('throws a 401 AppError when the current password is incorrect', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hash-actual',
    } as never)
    vi.mocked(hash.comparePassword).mockResolvedValue(false)

    await expect(changeUserPassword('user-1', 'incorrecta', 'nueva12345')).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  // Given a user who signed up via social login only (no password set)
  // When trying to change the password
  // Then it should throw a 400 AppError
  it('throws a 400 AppError when the user has no password set', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      passwordHash: null,
    } as never)

    await expect(changeUserPassword('user-1', 'actual123', 'nueva12345')).rejects.toMatchObject({
      statusCode: 400,
      code: 'NO_PASSWORD_SET',
    })
  })
})

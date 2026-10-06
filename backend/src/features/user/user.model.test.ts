import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import { updateUserAndMembership } from './user.model'

vi.mock('../../config/db', () => ({
  default: {
    user: { update: vi.fn() },
    businessMember: { update: vi.fn() },
    $transaction: vi.fn(),
  },
}))

describe('updateUserAndMembership', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.$transaction).mockImplementation((async (operations: unknown[]) =>
      Promise.all(operations)) as never)
  })

  // Given only "name" is provided
  // When updating the profile
  // Then the User update only touches name and the membership update is empty
  it('only writes the fields that were provided', async () => {
    await updateUserAndMembership('user-1', 'biz-1', { name: 'Nuevo Nombre' })

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
  // Then the User update is a no-op and the membership only touches avatarUrl
  it('does not touch name or notificationPrefs when only avatarUrl changes', async () => {
    await updateUserAndMembership('user-1', 'biz-1', { avatarUrl: 'https://cdn.test/new.png' })

    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: {} })
    expect(prisma.businessMember.update).toHaveBeenCalledWith({
      where: { businessId_userId: { businessId: 'biz-1', userId: 'user-1' }, status: 'ACTIVE' },
      data: { avatarUrl: 'https://cdn.test/new.png' },
      include: { user: true },
    })
  })
})

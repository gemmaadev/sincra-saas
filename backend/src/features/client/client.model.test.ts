import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import {
  findActiveClientTag,
  insertClientTag,
  markClientTagRemoved,
  findClientWithDetails,
} from './client.model'

vi.mock('../../config/db', () => ({
  default: {
    clientTag: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    client: { findUnique: vi.fn() },
  },
}))

describe('findClientWithDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a client id
  // When fetching its detail
  // Then it should include its active tags and its orders, newest first
  it('includes the active tags and the orders, newest first', async () => {
    await findClientWithDetails('business-1', 'client-1')

    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: 'client-1', businessId: 'business-1' },
      include: {
        clientTags: { where: { removedAt: null }, include: { tag: true } },
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            number: true,
            status: true,
            kind: true,
            channel: true,
            price: true,
            expectedDate: true,
            createdAt: true,
          },
        },
      },
    })
  })
})

describe('client tag model', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a client and a tag
  // When looking for the active assignment
  // Then only assignments that were not removed should be considered
  it('looks only for assignments that were not removed', async () => {
    await findActiveClientTag('client-1', 'tag-1')

    expect(prisma.clientTag.findFirst).toHaveBeenCalledWith({
      where: { clientId: 'client-1', tagId: 'tag-1', removedAt: null },
    })
  })

  // Given a client and a tag
  // When the assignment is created
  // Then it should include the tag so the caller can show it
  it('creates the assignment including the tag', async () => {
    await insertClientTag('client-1', 'tag-1')

    expect(prisma.clientTag.create).toHaveBeenCalledWith({
      data: { clientId: 'client-1', tagId: 'tag-1' },
      include: { tag: true },
    })
  })

  // Given an active assignment
  // When it is removed
  // Then removedAt should be set and the row should never be deleted
  it('sets removedAt instead of deleting the row', async () => {
    await markClientTagRemoved('assignment-1')

    expect(prisma.clientTag.update).toHaveBeenCalledWith({
      where: { id: 'assignment-1' },
      data: { removedAt: expect.any(Date) },
    })
    expect(prisma.clientTag.delete).not.toHaveBeenCalled()
  })
})

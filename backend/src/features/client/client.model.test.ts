import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import {
  findActiveClientTag,
  insertClientTag,
  markClientTagRemoved,
  findClientWithDetails,
  findClientsPage,
  countRecurringClients,
} from './client.model'

vi.mock('../../config/db', () => ({
  default: {
    clientTag: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    client: { findUnique: vi.fn(), findMany: vi.fn() },
    order: { groupBy: vi.fn() },
  },
}))

describe('findClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a where clause, skip and take
  // When listing a page of clients
  // Then each row should include its order count and the date of its most recent order
  it('includes the order count and the most recent order date', async () => {
    await findClientsPage({ businessId: 'business-1' }, 0, 20)

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: { businessId: 'business-1' },
      skip: 0,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        clientTags: { where: { removedAt: null }, include: { tag: true } },
        _count: { select: { orders: true } },
        orders: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
      },
    })
  })
})

describe('countRecurringClients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a client-level filter (business, and possibly channel/tag/search)
  // When counting recurring clients
  // Then it should group the client's orders and only keep clients with 2 or more
  it('groups orders by client and filters to 2 or more, honoring the client filter', async () => {
    vi.mocked(prisma.order.groupBy).mockResolvedValue([
      { clientId: 'client-1' },
      { clientId: 'client-2' },
    ] as never)

    const result = await countRecurringClients({ businessId: 'business-1', type: 'empresa' })

    expect(prisma.order.groupBy).toHaveBeenCalledWith({
      by: ['clientId'],
      where: { client: { businessId: 'business-1', type: 'empresa' } },
      having: { clientId: { _count: { gte: 2 } } },
    })
    expect(result).toBe(2)
  })

  // Given no client has 2 or more orders
  // When counting recurring clients
  // Then it should return 0
  it('returns 0 when no client qualifies', async () => {
    vi.mocked(prisma.order.groupBy).mockResolvedValue([] as never)

    expect(await countRecurringClients({ businessId: 'business-1' })).toBe(0)
  })
})

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
            description: true,
            items: { select: { product: true, quantity: true } },
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

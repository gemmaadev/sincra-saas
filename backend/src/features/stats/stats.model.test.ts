import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import {
  countClientsByTypeInRange,
  countClientsCreatedInRange,
  countOrdersByStatusInRange,
  countOrdersCreatedInRange,
  findDeliveredOrdersInRange,
  findOrderCreatedDatesInRange,
} from './stats.model'

vi.mock('../../config/db', () => ({
  default: {
    client: { count: vi.fn(), groupBy: vi.fn() },
    order: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
  },
}))

describe('countClientsCreatedInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a createdAt range
  // When counting clients created in that range
  // Then it should filter by business and the range
  it('counts clients by business and createdAt range', async () => {
    const range = { gte: new Date('2026-10-01'), lte: new Date('2026-10-31') }

    await countClientsCreatedInRange('business-1', range)

    expect(prisma.client.count).toHaveBeenCalledWith({
      where: { businessId: 'business-1', createdAt: range },
    })
  })

  // Given no range
  // When counting clients
  // Then it should filter by business only
  it('counts all of a business clients when no range is given', async () => {
    await countClientsCreatedInRange('business-1')

    expect(prisma.client.count).toHaveBeenCalledWith({ where: { businessId: 'business-1' } })
  })
})

describe('countClientsByTypeInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a createdAt range
  // When counting clients grouped by type in that range
  // Then it should group by type, filtered by business and the range
  it('groups clients by type, filtered by business and createdAt range', async () => {
    const range = { gte: new Date('2026-10-01'), lte: new Date('2026-10-31') }

    await countClientsByTypeInRange('business-1', range)

    expect(prisma.client.groupBy).toHaveBeenCalledWith({
      by: ['type'],
      where: { businessId: 'business-1', createdAt: range },
      _count: true,
    })
  })
})

describe('countOrdersCreatedInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a createdAt range
  // When counting orders created in that range
  // Then it should filter by business and the range
  it('counts orders by business and createdAt range', async () => {
    const range = { gte: new Date('2026-10-01'), lte: new Date('2026-10-31') }

    await countOrdersCreatedInRange('business-1', range)

    expect(prisma.order.count).toHaveBeenCalledWith({
      where: { businessId: 'business-1', createdAt: range },
    })
  })
})

describe('countOrdersByStatusInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a createdAt range
  // When counting orders grouped by status in that range
  // Then it should group by status, filtered by business and the range
  it('groups orders by status, filtered by business and createdAt range', async () => {
    const range = { gte: new Date('2026-10-01'), lte: new Date('2026-10-31') }

    await countOrdersByStatusInRange('business-1', range)

    expect(prisma.order.groupBy).toHaveBeenCalledWith({
      by: ['status'],
      where: { businessId: 'business-1', createdAt: range },
      _count: true,
    })
  })
})

describe('findOrderCreatedDatesInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a createdAt range
  // When finding order creation dates in that range
  // Then it should filter by business and the range, selecting only createdAt
  it('finds order creation dates by business and createdAt range', async () => {
    const range = { gte: new Date('2026-10-01'), lte: new Date('2026-10-31') }

    await findOrderCreatedDatesInRange('business-1', range)

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { businessId: 'business-1', createdAt: range },
      select: { createdAt: true },
    })
  })
})

describe('findDeliveredOrdersInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a createdAt range
  // When finding delivered orders in that range
  // Then it should filter by business, DELIVERED status and the range, including the last DELIVERED status change
  it('finds delivered orders with their last DELIVERED status change', async () => {
    const range = { gte: new Date('2026-10-01'), lte: new Date('2026-10-31') }

    await findDeliveredOrdersInRange('business-1', range)

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { businessId: 'business-1', status: 'DELIVERED', createdAt: range },
      select: {
        id: true,
        price: true,
        createdAt: true,
        statusHistory: {
          where: { status: 'DELIVERED' },
          orderBy: { changedAt: 'desc' },
          take: 1,
          select: { changedAt: true },
        },
      },
    })
  })
})

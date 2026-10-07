import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import {
  findMaxOrderNumber,
  insertOrder,
  findOrdersPage,
  countOrdersByStatus,
  updateOrderWithItems,
  deleteOrderById,
} from './order.model'

vi.mock('../../config/db', () => ({
  default: {
    order: {
      aggregate: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
      update: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      delete: vi.fn(),
    },
    orderItem: { deleteMany: vi.fn(), createMany: vi.fn() },
    orderStatusChange: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

describe('findOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a where clause, skip and take
  // When listing a page of orders
  // Then each row should include the client's name and only the first item (for the table's product column)
  it('includes the client and only the first item of each order', async () => {
    await findOrdersPage({ businessId: 'business-1' }, 0, 20)

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { businessId: 'business-1' },
      skip: 0,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        items: { take: 1, select: { product: true, description: true } },
      },
    })
  })
})

describe('countOrdersByStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business
  // When counting its orders by status
  // Then it should group by status, scoped to that business, regardless of any list filter
  it('groups the counts by status, scoped to the business', async () => {
    await countOrdersByStatus('business-1')

    expect(prisma.order.groupBy).toHaveBeenCalledWith({
      by: ['status'],
      where: { businessId: 'business-1' },
      _count: true,
    })
  })
})

describe('findMaxOrderNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business with no orders yet
  // When asking for its highest order number
  // Then it should return 0, so the caller can start numbering at 1
  it('returns 0 when the business has no orders', async () => {
    vi.mocked(prisma.order.aggregate).mockResolvedValue({ _max: { number: null } } as never)

    expect(await findMaxOrderNumber('business-1')).toBe(0)
  })

  // Given a business with existing orders
  // When asking for its highest order number
  // Then it should return that maximum, scoped to the business
  it('returns the current maximum for the business', async () => {
    vi.mocked(prisma.order.aggregate).mockResolvedValue({ _max: { number: 1042 } } as never)

    expect(await findMaxOrderNumber('business-1')).toBe(1042)
    expect(prisma.order.aggregate).toHaveBeenCalledWith({
      where: { businessId: 'business-1' },
      _max: { number: true },
    })
  })
})

describe('insertOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given the data for a new order
  // When it is inserted
  // Then it should be created including the client, its items and its status timeline
  it('creates the order including client, items and status history', async () => {
    const data = { businessId: 'business-1', clientId: 'client-1', number: 1 } as never

    await insertOrder(data)

    expect(prisma.order.create).toHaveBeenCalledWith({
      data,
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    })
  })
})

describe('updateOrderWithItems', () => {
  const tx = {
    order: { update: vi.fn(), findUniqueOrThrow: vi.fn() },
    orderItem: { deleteMany: vi.fn(), createMany: vi.fn() },
    orderStatusChange: { create: vi.fn() },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    tx.order.findUniqueOrThrow.mockResolvedValue({ id: 'order-1' })
    vi.mocked(prisma.$transaction).mockImplementation((callback) =>
      (callback as (client: typeof tx) => unknown)(tx),
    )
  })

  // Given only plain field changes (no items, no status change)
  // When the order is updated
  // Then only the order row is touched, and the items/history are left alone
  it('updates only the order fields when neither items nor a status change are given', async () => {
    await updateOrderWithItems('order-1', { notes: 'Entregar por la tarde' })

    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { notes: 'Entregar por la tarde' },
    })
    expect(tx.orderItem.deleteMany).not.toHaveBeenCalled()
    expect(tx.orderItem.createMany).not.toHaveBeenCalled()
    expect(tx.orderStatusChange.create).not.toHaveBeenCalled()
  })

  // Given a new list of items
  // When the order is updated
  // Then the previous items are deleted and replaced by the new ones
  it('replaces the items when new ones are given', async () => {
    const items = [{ product: 'Camiseta', quantity: 2, unitPrice: 15 }]

    await updateOrderWithItems('order-1', { price: 30 }, items)

    expect(tx.orderItem.deleteMany).toHaveBeenCalledWith({ where: { orderId: 'order-1' } })
    expect(tx.orderItem.createMany).toHaveBeenCalledWith({
      data: [{ product: 'Camiseta', quantity: 2, unitPrice: 15, orderId: 'order-1' }],
    })
  })

  // Given a status change
  // When the order is updated
  // Then a new entry is appended to the status history
  it('appends a status history entry when a status change is given', async () => {
    await updateOrderWithItems(
      'order-1',
      { status: 'SHIPPED' },
      undefined,
      { status: 'SHIPPED', changedBy: 'user-1' },
    )

    expect(tx.orderStatusChange.create).toHaveBeenCalledWith({
      data: { orderId: 'order-1', status: 'SHIPPED', changedBy: 'user-1' },
    })
  })

  // Given the transaction completes
  // When the update finishes
  // Then it should return the order with its full detail
  it('returns the order with its full detail', async () => {
    tx.order.findUniqueOrThrow.mockResolvedValue({ id: 'order-1', notes: 'listo' })

    const result = await updateOrderWithItems('order-1', { notes: 'listo' })

    expect(result).toEqual({ id: 'order-1', notes: 'listo' })
  })
})

describe('deleteOrderById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an order id
  // When it is deleted
  // Then prisma should delete that row (cascading to its items/history/tags)
  it('deletes the order', async () => {
    await deleteOrderById('order-1')

    expect(prisma.order.delete).toHaveBeenCalledWith({ where: { id: 'order-1' } })
  })
})

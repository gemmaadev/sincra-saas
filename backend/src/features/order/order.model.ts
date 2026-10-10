import prisma from '../../config/db'
import type { Prisma, OrderStatus } from '../../generated/prisma/client'

const ORDER_LIST_INCLUDE = {
  client: { select: { id: true, name: true } },
  items: { select: { product: true, quantity: true } },
} satisfies Prisma.OrderInclude

const ORDER_DETAIL_INCLUDE = {
  client: { select: { id: true, name: true, email: true, phone: true, channels: true } },
  items: true,
  statusHistory: { orderBy: { changedAt: 'asc' } },
  orderTags: { where: { removedAt: null }, include: { tag: true } },
} satisfies Prisma.OrderInclude

export async function findMaxOrderNumber(businessId: string) {
  const result = await prisma.order.aggregate({ where: { businessId }, _max: { number: true } })
  return result._max.number ?? 0
}

export async function insertOrder(data: Prisma.OrderUncheckedCreateInput) {
  return prisma.order.create({ data, include: ORDER_DETAIL_INCLUDE })
}

export async function findOrdersPage(where: Prisma.OrderWhereInput, skip: number, take: number) {
  return prisma.order.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: ORDER_LIST_INCLUDE,
  })
}

export async function countOrders(where: Prisma.OrderWhereInput) {
  return prisma.order.count({ where })
}

export async function countOrdersByStatus(businessId: string) {
  return prisma.order.groupBy({ by: ['status'], where: { businessId }, _count: true })
}

export async function findOrderById(businessId: string, orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId, businessId } })
}

export async function findOrderWithDetails(businessId: string, orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId, businessId },
    include: ORDER_DETAIL_INCLUDE,
  })
}

interface OrderItemData {
  product: string
  description?: string | null
  quantity: number
  unitPrice: number
}

interface OrderStatusChangeData {
  status: OrderStatus
  changedBy?: string | null
}

export async function updateOrderWithItems(
  orderId: string,
  data: Prisma.OrderUpdateInput,
  items?: OrderItemData[],
  statusChange?: OrderStatusChangeData,
) {
  return prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data })

    if (items) {
      await tx.orderItem.deleteMany({ where: { orderId } })
      await tx.orderItem.createMany({ data: items.map((item) => ({ ...item, orderId })) })
    }

    if (statusChange) {
      await tx.orderStatusChange.create({ data: { orderId, ...statusChange } })
    }

    return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: ORDER_DETAIL_INCLUDE })
  })
}

export async function deleteOrderById(orderId: string) {
  await prisma.order.delete({ where: { id: orderId } })
}

export async function findActiveOrderTag(orderId: string, tagId: string) {
  return prisma.orderTag.findFirst({ where: { orderId, tagId, removedAt: null } })
}

export async function insertOrderTag(orderId: string, tagId: string) {
  return prisma.orderTag.create({ data: { orderId, tagId }, include: { tag: true } })
}

export async function markOrderTagRemoved(orderTagId: string) {
  await prisma.orderTag.update({ where: { id: orderTagId }, data: { removedAt: new Date() } })
}

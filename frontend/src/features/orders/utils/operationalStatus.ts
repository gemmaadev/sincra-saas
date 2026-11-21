import type { OrderStatus } from '../types/order.types'

const ASIDE_STATUSES = new Set<OrderStatus>(['CANCELLED', 'INCIDENT'])

// Cancelled and incident sit beside the delivery steps. The timeline keeps the last real step.
export function lastOperationalStatus(
  status: OrderStatus,
  history: { status: OrderStatus }[],
): OrderStatus {
  if (!ASIDE_STATUSES.has(status)) return status

  const previous = [...history].reverse().find((entry) => !ASIDE_STATUSES.has(entry.status))
  return previous?.status ?? 'PENDING'
}

export function canCancelOrder(status: OrderStatus, history: { status: OrderStatus }[]): boolean {
  if (status === 'CANCELLED') return false
  return lastOperationalStatus(status, history) !== 'DELIVERED'
}

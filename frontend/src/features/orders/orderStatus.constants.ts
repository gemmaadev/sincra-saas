import { Circle, Clock, Truck, CheckCircle, XCircle, type LucideIcon } from 'lucide-react'
import type { BadgeColor } from '@/shared/components'
import type { OrderStatus } from './types/order.types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'En preparación',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, BadgeColor> = {
  PENDING: 'neutral',
  PREPARING: 'warning',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
}

export const ORDER_STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  PENDING: Circle,
  PREPARING: Clock,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

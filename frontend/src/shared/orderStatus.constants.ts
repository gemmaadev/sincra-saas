import {
  Circle,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import type { BadgeColor } from '@/shared/components'
import type { OrderStatus } from '@/features/orders/types/order.types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'En preparación',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  INCIDENT: 'Incidencia',
  CANCELLED: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, BadgeColor> = {
  PENDING: 'neutral',
  PREPARING: 'warning',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  INCIDENT: 'error',
  CANCELLED: 'error',
}

export const ORDER_STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  PENDING: Circle,
  PREPARING: Clock,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  INCIDENT: AlertTriangle,
  CANCELLED: XCircle,
}

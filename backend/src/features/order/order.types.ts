import type { Channel, OrderKind, OrderStatus } from '../../generated/prisma/client'
import type { PaginationQuery } from '../../shared/utils/pagination.types'

export interface OrderItemInput {
  product: string
  description?: string | null
  quantity?: number
  unitPrice: number
}

export interface CreateOrderInput {
  clientId: string
  channel?: Channel | null
  kind?: OrderKind
  items: OrderItemInput[]
  address?: string | null
  zone?: string | null
  latitude?: number
  longitude?: number
  expectedDate?: Date | null
  description?: string | null
  notes?: string | null
}

export interface UpdateOrderInput {
  channel?: Channel | null
  kind?: OrderKind
  items?: OrderItemInput[]
  address?: string | null
  zone?: string | null
  latitude?: number
  longitude?: number
  expectedDate?: Date | null
  description?: string | null
  notes?: string | null
  status?: OrderStatus
}

export interface ListOrdersFilters extends PaginationQuery {
  status?: OrderStatus
  channel?: Channel
  dateFrom?: string
  dateTo?: string
}

import type { Channel } from '@/shared/types'

export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type OrderKind = 'PRODUCT' | 'SERVICE'

export interface OrderItemSummary {
  product: string
  description: string | null
}

export interface OrderClientSummary {
  id: string
  name: string
}

export interface Order {
  id: string
  number: number
  status: OrderStatus
  channel: Channel | null
  kind: OrderKind
  price: string | null
  expectedDate: string | null
  createdAt: string
  client: OrderClientSummary
  items: OrderItemSummary[]
}

export interface OrdersResponse {
  data: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  statusCounts: Record<OrderStatus, number>
}

export interface UseOrdersParams {
  page?: number
  limit?: number
  status?: OrderStatus
  channel?: Channel
  dateFrom?: string
  dateTo?: string
  search?: string
}

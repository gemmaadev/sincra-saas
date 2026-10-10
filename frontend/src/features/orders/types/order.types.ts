import type { Channel } from '@/shared/types'
import type { Tag } from '@/features/tags/types/tag.types'

export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type OrderKind = 'PRODUCT' | 'SERVICE'

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
  description: string | null
}

export interface OrderItem {
  id: string
  product: string
  description: string | null
  quantity: number
  unitPrice: string
}

export interface OrderStatusChangeEntry {
  id: string
  status: OrderStatus
  changedBy: string | null
  changedAt: string
}

export interface OrderDetailClient {
  id: string
  name: string
  email: string | null
  phone: string | null
  channels: Channel[]
}

export interface OrderTag {
  id: string
  tagId: string
  aiGenerated: boolean
  tag: Tag
}

export interface OrderDetail {
  id: string
  number: number
  status: OrderStatus
  channel: Channel | null
  kind: OrderKind
  price: string | null
  address: string | null
  zone: string | null
  expectedDate: string | null
  description: string | null
  client: OrderDetailClient
  items: OrderItem[]
  statusHistory: OrderStatusChangeEntry[]
  orderTags: OrderTag[]
  createdAt: string
  updatedAt: string
}

export interface OrderDetailResponse {
  order: OrderDetail
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

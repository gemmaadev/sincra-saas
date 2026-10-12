import type { Coordinates } from '@/features/clients/types/client.types'
import type { OrderDetail, OrderFormValues } from '../types/order.types'

export const EMPTY_ITEM = { product: '', description: '', quantity: 1, unitPrice: 0 }

function toDateInputValue(isoDate: string | null): string {
  return isoDate ? isoDate.slice(0, 10) : ''
}

export function toOrderFormValues(
  order?: OrderDetail,
  initialLocation?: Coordinates,
): OrderFormValues {
  return {
    clientId: order?.client.id ?? '',
    clientName: order?.client.name ?? '',
    items: order?.items.map((item) => ({
      product: item.product,
      description: item.description ?? '',
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })) ?? [EMPTY_ITEM],
    channel: order?.channel ?? '',
    zone: order?.zone ?? '',
    address: order?.address ?? '',
    expectedDate: toDateInputValue(order?.expectedDate ?? null),
    ...(!order && initialLocation),
  }
}

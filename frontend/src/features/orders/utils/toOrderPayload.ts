import { emptyToNull } from '@/shared/utils'
import type { OrderFormValues, OrderPayload } from '../types/order.types'

function toOptionalUnitPrice(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null
  return value
}

export function toOrderPayload(values: OrderFormValues): OrderPayload {
  return {
    clientId: values.clientId,
    items: values.items.map((item) => ({
      product: item.product.trim(),
      description: emptyToNull(item.description),
      quantity: item.quantity,
      unitPrice: toOptionalUnitPrice(item.unitPrice),
    })),
    channel: values.channel === '' ? null : values.channel,
    zone: emptyToNull(values.zone),
    address: emptyToNull(values.address),
    expectedDate: emptyToNull(values.expectedDate),
    description: emptyToNull(values.description),
    ...(values.latitude !== undefined &&
      values.longitude !== undefined && {
        latitude: values.latitude,
        longitude: values.longitude,
      }),
  }
}

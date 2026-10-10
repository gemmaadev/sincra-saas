import type { OrderFormValues, OrderPayload } from '../types/order.types'

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toOrderPayload(values: OrderFormValues): OrderPayload {
  return {
    clientId: values.clientId,
    items: values.items.map((item) => ({
      product: item.product.trim(),
      description: emptyToNull(item.description),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    channel: values.channel === '' ? null : values.channel,
    zone: emptyToNull(values.zone),
    address: emptyToNull(values.address),
    expectedDate: emptyToNull(values.expectedDate),
  }
}

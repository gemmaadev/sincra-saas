import { emptyToNull } from '@/shared/utils'
import type { ClientFormValues, ClientPayload } from '../types/client.types'

export function toClientPayload(values: ClientFormValues): ClientPayload {
  return {
    name: values.name.trim(),
    email: emptyToNull(values.email),
    phone: emptyToNull(values.phone),
    channels: values.channels,
    type: emptyToNull(values.type),
    zone: emptyToNull(values.zone),
    address: emptyToNull(values.address),
    ...(values.latitude !== undefined &&
      values.longitude !== undefined && {
        latitude: values.latitude,
        longitude: values.longitude,
      }),
  }
}

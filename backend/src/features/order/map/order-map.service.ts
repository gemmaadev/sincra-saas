import { findOrdersForMap } from './order-map.model'
import type { OrderMapFilters, OrderMapRecord, OrderMapResponse, OrderMapZoneSummary } from './order-map.types'

function toPercentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

function resolveZone(record: OrderMapRecord): string | null {
  return record.zone?.trim() || record.client.zone?.trim() || null
}

export function buildOrderZoneSummary(records: OrderMapRecord[]): OrderMapZoneSummary[] {
  const zones = new Map<string, OrderMapZoneSummary>()

  for (const record of records) {
    const zone = resolveZone(record)
    if (!zone) continue

    const key = zone.toLowerCase()
    const existing = zones.get(key)

    if (existing) {
      existing.count += 1
    } else {
      zones.set(key, { zone, count: 1, percentage: 0 })
    }
  }

  return [...zones.values()]
    .map((summary) => ({ ...summary, percentage: toPercentage(summary.count, records.length) }))
    .sort((first, second) => second.count - first.count || first.zone.localeCompare(second.zone))
}

export async function getOrderMap(
  businessId: string,
  filters: OrderMapFilters,
): Promise<OrderMapResponse> {
  const records = await findOrdersForMap(businessId, filters)

  return {
    total: records.length,
    zones: buildOrderZoneSummary(records),
    ordersWithoutZone: records.filter((record) => !resolveZone(record)).length,
  }
}

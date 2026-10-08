import { Prisma } from '../../../generated/prisma/client'
import { findOrdersForMap } from './order-map.model'
import type { OrderMapFilters, OrderMapRecord, OrderMapResponse, OrderMapZoneSummary } from './order-map.types'

function toPercentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

function resolveZone(record: OrderMapRecord): string | null {
  return record.zone?.trim() || record.client.zone?.trim() || null
}

function sumRevenue(records: OrderMapRecord[]): Prisma.Decimal {
  return records.reduce((total, record) => total.plus(record.price ?? 0), new Prisma.Decimal(0))
}

// Only delivered orders count as real revenue — a pending/shipped order could still be
// cancelled before it completes, and a cancelled one was never actually paid.
export function buildOrderZoneSummary(deliveredRecords: OrderMapRecord[]): OrderMapZoneSummary[] {
  const zones = new Map<string, { records: OrderMapRecord[] }>()

  for (const record of deliveredRecords) {
    const zone = resolveZone(record)
    if (!zone) continue

    const key = zone.toLowerCase()
    const existing = zones.get(key)

    if (existing) {
      existing.records.push(record)
    } else {
      zones.set(key, { records: [record] })
    }
  }

  return [...zones.entries()]
    .map(([, { records }]) => ({
      zone: resolveZone(records[0]) as string,
      count: records.length,
      revenue: sumRevenue(records),
      percentage: toPercentage(records.length, deliveredRecords.length),
    }))
    .sort((first, second) => second.revenue.comparedTo(first.revenue) || first.zone.localeCompare(second.zone))
    .map((summary) => ({ ...summary, revenue: summary.revenue.toString() }))
}

export async function getOrderMap(
  businessId: string,
  filters: OrderMapFilters,
): Promise<OrderMapResponse> {
  const records = await findOrdersForMap(businessId, filters)
  const deliveredRecords = records.filter((record) => record.status === 'DELIVERED')

  return {
    total: records.length,
    deliveredRevenue: sumRevenue(deliveredRecords).toString(),
    zones: buildOrderZoneSummary(deliveredRecords),
  }
}

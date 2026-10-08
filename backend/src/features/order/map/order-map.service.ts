import { Prisma } from '../../../generated/prisma/client'
import { findOrdersForMap } from './order-map.model'
import type {
  MapOrder,
  OrderMapFilters,
  OrderMapRecord,
  OrderMapResponse,
  OrderMapZoneSummary,
} from './order-map.types'

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

interface OrderLocation {
  latitude: number
  longitude: number
  approximate: boolean
}

// An order is placed at its own coordinates when it has them; otherwise it falls back to its
// client's location (approximate), the same location the client's own marker uses.
function resolveOrderLocation(record: OrderMapRecord): OrderLocation | null {
  if (record.latitude !== null && record.longitude !== null) {
    return { latitude: record.latitude, longitude: record.longitude, approximate: false }
  }

  if (record.client.latitude !== null && record.client.longitude !== null) {
    return { latitude: record.client.latitude, longitude: record.client.longitude, approximate: true }
  }

  return null
}

function toMapOrder(record: OrderMapRecord): MapOrder | null {
  const location = resolveOrderLocation(record)
  if (!location) return null

  return {
    id: record.id,
    number: record.number,
    status: record.status,
    channel: record.channel,
    price: (record.price ?? new Prisma.Decimal(0)).toString(),
    zone: resolveZone(record),
    clientName: record.client.name,
    ...location,
  }
}

export function buildMapOrders(records: OrderMapRecord[]): MapOrder[] {
  return records
    .map(toMapOrder)
    .filter((mapOrder): mapOrder is MapOrder => mapOrder !== null)
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
    orders: buildMapOrders(records),
  }
}

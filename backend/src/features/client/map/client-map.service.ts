import type { Channel } from '../../../generated/prisma/client'
import { findClientsForMap, findZoneCoordinates } from './client-map.model'
import type {
  ChannelShare,
  ClientMapFilters,
  ClientMapRecord,
  ClientMapResponse,
  Coordinates,
  MapClient,
  ZonePoint,
  ZoneSummary,
} from './client-map.types'

const NO_ZONE_LABEL = 'Sin zona'

function toPercentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

function getZoneLabel(zone: string | null): string {
  return zone?.trim() || NO_ZONE_LABEL
}

function getZoneKey(zone: string | null): string | null {
  const trimmedZone = zone?.trim()
  return trimmedZone ? trimmedZone.toLowerCase() : null
}

function roundCoordinate(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

export function buildZoneSummary(records: ClientMapRecord[]): ZoneSummary[] {
  const zones = new Map<string, ZoneSummary>()

  for (const record of records) {
    const label = getZoneLabel(record.zone)
    const key = label.toLowerCase()
    const existing = zones.get(key)

    if (existing) {
      existing.count += 1
    } else {
      zones.set(key, { zone: label, count: 1, percentage: 0 })
    }
  }

  return [...zones.values()]
    .map((summary) => ({ ...summary, percentage: toPercentage(summary.count, records.length) }))
    .sort((first, second) => second.count - first.count || first.zone.localeCompare(second.zone))
}

export function buildChannelOrigin(records: ClientMapRecord[]): ChannelShare[] {
  const counts = new Map<Channel, number>()

  for (const record of records) {
    for (const channel of record.channels) {
      counts.set(channel, (counts.get(channel) ?? 0) + 1)
    }
  }

  const totalMemberships = [...counts.values()].reduce((total, count) => total + count, 0)

  return [...counts.entries()]
    .map(([channel, count]) => ({
      channel,
      count,
      percentage: toPercentage(count, totalMemberships),
    }))
    .sort(
      (first, second) => second.count - first.count || first.channel.localeCompare(second.channel),
    )
}

export function computeZoneCentroids(points: ZonePoint[]): Map<string, Coordinates> {
  const sums = new Map<string, { latitude: number; longitude: number; count: number }>()

  for (const point of points) {
    const key = getZoneKey(point.zone)
    if (!key || point.latitude === null || point.longitude === null) continue

    const sum = sums.get(key) ?? { latitude: 0, longitude: 0, count: 0 }
    sum.latitude += point.latitude
    sum.longitude += point.longitude
    sum.count += 1
    sums.set(key, sum)
  }

  const centroids = new Map<string, Coordinates>()
  for (const [key, sum] of sums) {
    centroids.set(key, {
      latitude: roundCoordinate(sum.latitude / sum.count),
      longitude: roundCoordinate(sum.longitude / sum.count),
    })
  }

  return centroids
}

export function buildMapClients(
  records: ClientMapRecord[],
  centroids: Map<string, Coordinates>,
): MapClient[] {
  const mapClients: MapClient[] = []

  for (const record of records) {
    const { latitude, longitude, ...rest } = record

    if (latitude !== null && longitude !== null) {
      mapClients.push({ ...rest, latitude, longitude, approximate: false })
      continue
    }

    const zoneKey = getZoneKey(record.zone)
    const centroid = zoneKey ? centroids.get(zoneKey) : undefined
    if (centroid) {
      mapClients.push({ ...rest, ...centroid, approximate: true })
    }
  }

  return mapClients
}

export async function getClientMap(
  businessId: string,
  filters: ClientMapFilters,
): Promise<ClientMapResponse> {
  const [records, zonePoints] = await Promise.all([
    findClientsForMap(businessId, filters),
    findZoneCoordinates(businessId),
  ])

  return {
    total: records.length,
    clients: buildMapClients(records, computeZoneCentroids(zonePoints)),
    zones: buildZoneSummary(records),
    channelOrigin: buildChannelOrigin(records),
  }
}

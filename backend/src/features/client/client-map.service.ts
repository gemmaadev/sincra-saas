import type { Channel } from '../../generated/prisma/client'
import type { ChannelShare, ClientMapRecord, ZoneSummary } from './client-map.types'

const NO_ZONE_LABEL = 'Sin zona'

function toPercentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

function getZoneLabel(zone: string | null): string {
  return zone?.trim() || NO_ZONE_LABEL
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

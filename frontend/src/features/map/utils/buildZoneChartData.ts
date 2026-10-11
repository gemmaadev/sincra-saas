import type { OrderMapZoneSummary } from '../types/map.types'

export interface ZoneChartPoint {
  zone: string
  value: number
}

export function buildRevenueByZone(zones: OrderMapZoneSummary[]): ZoneChartPoint[] {
  return zones.map((zone) => ({ zone: zone.zone, value: Number(zone.revenue) }))
}

export function buildAverageTicketByZone(zones: OrderMapZoneSummary[]): ZoneChartPoint[] {
  return zones.map((zone) => ({ zone: zone.zone, value: Number(zone.revenue) / zone.count }))
}

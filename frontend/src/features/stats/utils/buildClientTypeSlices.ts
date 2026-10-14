import type { ClientsByType } from '../types/stats.types'
import type { StatsDonutSlice } from '../components/StatsDonutChart'

// Free text has no fixed values, so colors cycle by position instead of a per-value map.
const CHART_PALETTE = ['#1e5eff', '#3fa65c', '#d99a34', '#e5484d', '#0f2d5b', '#94a3b8']

export function buildClientTypeSlices(clientsByType: ClientsByType): StatsDonutSlice[] {
  return clientsByType.types.map((entry, index) => ({
    label: entry.type,
    value: entry.count,
    percentage: entry.percentage,
    color: CHART_PALETTE[index % CHART_PALETTE.length]!,
  }))
}

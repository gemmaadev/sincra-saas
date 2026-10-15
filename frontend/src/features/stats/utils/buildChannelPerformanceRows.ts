import type { IconType } from 'react-icons'
import { FiSlash } from 'react-icons/fi'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import type { ChannelPerformance } from '../types/stats.types'

const NO_CHANNEL_COLOR_CLASS_NAME = 'text-ink-muted'

export interface ChannelPerformanceRow {
  label: string
  icon: IconType
  colorClassName: string
  revenue: number
  averageTicket: number
  percentage: number
}

function resolveLabel(channel: string | null): string {
  if (!channel) return 'Sin canal'
  return CHANNEL_BRANDS.find((brand) => brand.id === channel.toLowerCase())?.name ?? channel
}

export function buildChannelPerformanceRows(
  channelPerformance: ChannelPerformance,
): ChannelPerformanceRow[] {
  const totalRevenue = channelPerformance.entries.reduce(
    (sum, entry) => sum + Number(entry.revenue),
    0,
  )

  return channelPerformance.entries.map((entry) => {
    const revenue = Number(entry.revenue)
    const brand = entry.channel
      ? CHANNEL_BRANDS.find((candidate) => candidate.id === entry.channel!.toLowerCase())
      : undefined

    return {
      label: resolveLabel(entry.channel),
      icon: brand?.icon ?? FiSlash,
      colorClassName: brand?.colorClassName ?? NO_CHANNEL_COLOR_CLASS_NAME,
      revenue,
      averageTicket: Number(entry.averageTicket),
      percentage: totalRevenue === 0 ? 0 : Math.round((revenue / totalRevenue) * 1000) / 10,
    }
  })
}

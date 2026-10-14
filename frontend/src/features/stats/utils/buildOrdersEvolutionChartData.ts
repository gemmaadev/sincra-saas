import type { OrdersEvolution } from '../types/stats.types'

export interface EvolutionChartPoint {
  label: string
  value: number
}

function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year!, month! - 1, day)
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date)
}

export function buildOrdersEvolutionChartData(evolution: OrdersEvolution): EvolutionChartPoint[] {
  return evolution.points.map((point) => ({
    label: formatShortDate(point.date),
    value: point.count,
  }))
}

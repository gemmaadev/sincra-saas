import { Package, Layers, Euro, Trophy } from 'lucide-react'
import type { KpiCardProps } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { OrderMapResponse } from '../types/map.types'

export interface OrderMapKpis {
  totalOrders: number
  zonesWithSales: number
  deliveredRevenue: number
  topRevenueZone: string | null
}

export function buildOrderMapKpis({ total, deliveredRevenue, zones }: OrderMapResponse): OrderMapKpis {
  const [topZone] = zones

  return {
    totalOrders: total,
    zonesWithSales: zones.length,
    deliveredRevenue: Number(deliveredRevenue),
    topRevenueZone: topZone?.zone ?? null,
  }
}

export function toOrderKpiCards(kpis: OrderMapKpis | null): KpiCardProps[] {
  if (!kpis) {
    return [
      { icon: Package, label: 'Pedidos en el mapa', value: '', pending: true },
      { icon: Layers, label: 'Zonas con ventas', value: '', pending: true },
      { icon: Euro, label: 'Ingresos totales', value: '', pending: true },
      { icon: Trophy, label: 'Zona con más ingresos', value: '', pending: true },
    ]
  }

  return [
    {
      icon: Package,
      label: 'Pedidos en el mapa',
      value: String(kpis.totalOrders),
      infoTooltip: 'Incluye pedidos de cualquier estado, no solo entregados',
    },
    { icon: Layers, label: 'Zonas con ventas', value: String(kpis.zonesWithSales) },
    { icon: Euro, label: 'Ingresos totales', value: formatCurrency(kpis.deliveredRevenue) },
    { icon: Trophy, label: 'Zona con más ingresos', value: kpis.topRevenueZone ?? '—' },
  ]
}

import { Users, ShoppingCart, Clock, Euro } from 'lucide-react'
import type { KpiCardProps } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { StatsOverview } from '../types/stats.types'

export function buildStatsKpiCards(overview: StatsOverview | null): KpiCardProps[] {
  if (!overview) {
    return [
      { icon: Users, label: 'Clientes nuevos', value: '', pending: true },
      { icon: ShoppingCart, label: 'Pedidos generados', value: '', pending: true },
      { icon: Clock, label: 'Tiempo medio hasta entrega', value: '', pending: true },
      { icon: Euro, label: 'Ingresos', value: '', pending: true },
    ]
  }

  return [
    { icon: Users, label: 'Clientes nuevos', value: String(overview.newClients) },
    { icon: ShoppingCart, label: 'Pedidos generados', value: String(overview.ordersCreated) },
    {
      icon: Clock,
      label: 'Tiempo medio hasta entrega',
      value: overview.averageDeliveryDays === null ? '—' : `${overview.averageDeliveryDays} días`,
      infoTooltip: 'Días entre la creación del pedido y su última entrega.',
    },
    {
      icon: Euro,
      label: 'Ingresos',
      value: formatCurrency(Number(overview.revenue)),
      infoTooltip: 'Suma de pedidos entregados en el periodo.',
    },
  ]
}

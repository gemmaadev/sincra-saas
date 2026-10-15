import ReactECharts from 'echarts-for-react'
import { Card, InfoTooltip } from '@/shared/components'
import type { EvolutionChartPoint } from '../utils/buildOrdersEvolutionChartData'
import type { OrdersEvolutionGranularity } from '../types/stats.types'
import { StatsGranularityToggle } from './StatsGranularityToggle'

interface StatsEvolutionChartProps {
  data: EvolutionChartPoint[]
  granularity: OrdersEvolutionGranularity
  onGranularityChange: (value: OrdersEvolutionGranularity) => void
  infoTooltip?: string
}

export function StatsEvolutionChart({
  data,
  granularity,
  onGranularityChange,
  infoTooltip,
}: StatsEvolutionChartProps) {
  const option = {
    grid: { left: 8, right: 8, top: 16, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((point) => point.label),
      axisTick: { show: false },
    },
    yAxis: { type: 'value' },
    tooltip: { trigger: 'axis', appendToBody: true },
    series: [
      {
        type: 'bar',
        data: data.map((point) => point.value),
        itemStyle: { color: '#1e5eff', borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 32,
      },
    ],
  }

  return (
    <Card padding="md" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="font-semibold text-ink">Evolución de pedidos</h2>
          {infoTooltip && <InfoTooltip label={infoTooltip} />}
        </div>
        <StatsGranularityToggle granularity={granularity} onGranularityChange={onGranularityChange} />
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-ink-muted">Todavía no hay pedidos en este periodo.</p>
      ) : (
        <ReactECharts option={option} style={{ height: 240 }} />
      )}
    </Card>
  )
}

import ReactECharts from 'echarts-for-react'
import { Card } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { ZoneChartPoint } from '../utils/buildZoneChartData'

interface ZoneBarChartProps {
  title: string
  data: ZoneChartPoint[]
}

export function ZoneBarChart({ title, data }: ZoneBarChartProps) {
  const option = {
    grid: { left: 8, right: 8, top: 16, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((point) => point.zone),
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => formatCurrency(value) },
    },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => formatCurrency(value),
    },
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
      <h2 className="font-semibold text-ink">{title}</h2>
      {data.length === 0 ? (
        <p className="text-sm text-ink-muted">Todavía no hay pedidos entregados en ninguna zona.</p>
      ) : (
        <ReactECharts option={option} style={{ height: 240 }} />
      )}
    </Card>
  )
}

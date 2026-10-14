import ReactECharts from 'echarts-for-react'
import { Card } from '@/shared/components'

export interface StatsDonutSlice {
  label: string
  value: number
  percentage: number
  color: string
}

interface StatsDonutChartProps {
  title: string
  total: number
  totalLabel: string
  slices: StatsDonutSlice[]
  emptyMessage: string
}

export function StatsDonutChart({
  title,
  total,
  totalLabel,
  slices,
  emptyMessage,
}: StatsDonutChartProps) {
  const option = {
    // appendToBody: otherwise the tooltip can get painted over by a sibling like the sidebar.
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', appendToBody: true },
    series: [
      {
        type: 'pie',
        radius: ['65%', '85%'],
        label: { show: false },
        data: slices.map((slice) => ({
          name: slice.label,
          value: slice.value,
          itemStyle: { color: slice.color },
        })),
      },
    ],
  }

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <h2 className="font-semibold text-ink">{title}</h2>
      {total === 0 ? (
        <p className="text-sm text-ink-muted">{emptyMessage}</p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <ReactECharts option={option} style={{ width: 160, height: 160 }} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-ink">{total}</span>
              <span className="text-xs text-ink-muted">{totalLabel}</span>
            </div>
          </div>
          <ul className="flex flex-1 flex-col gap-2">
            {slices.map((slice) => (
              <li key={slice.label} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-ink">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden="true"
                  />
                  {slice.label}
                </span>
                <span className="text-ink-muted">{slice.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

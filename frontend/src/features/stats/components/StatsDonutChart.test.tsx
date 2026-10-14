import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StatsDonutChart } from './StatsDonutChart'

// jsdom has no real <canvas> context, and disposing a real ECharts instance between tests
// throws async errors that can fail unrelated tests. We only need to check that our component
// passes the right data — rendering the chart itself is echarts-for-react's own job.
vi.mock('echarts-for-react', () => ({
  default: () => <div data-testid="echarts-mock" />,
}))

describe('StatsDonutChart', () => {
  // Given no data (total is zero)
  // When the chart is rendered
  // Then it should show the empty message instead of an empty chart
  it('shows an empty message when total is zero', () => {
    render(
      <StatsDonutChart
        title="Pedidos por estado"
        total={0}
        totalLabel="pedidos"
        slices={[]}
        emptyMessage="Todavía no hay pedidos en este periodo."
      />,
    )

    expect(screen.getByText('Pedidos por estado')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay pedidos en este periodo.')).toBeInTheDocument()
  })

  // Given slices with data
  // When the chart is rendered
  // Then it should show the total, the title and each slice's label and percentage
  it('renders the total and each slice when there is data', () => {
    render(
      <StatsDonutChart
        title="Pedidos por estado"
        total={10}
        totalLabel="pedidos"
        slices={[
          { label: 'Pendiente', value: 3, percentage: 30, color: '#94a3b8' },
          { label: 'Entregado', value: 7, percentage: 70, color: '#3fa65c' },
        ]}
        emptyMessage="Todavía no hay pedidos en este periodo."
      />,
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('pedidos')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('30%')).toBeInTheDocument()
    expect(screen.getByText('Entregado')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(
      screen.queryByText('Todavía no hay pedidos en este periodo.'),
    ).not.toBeInTheDocument()
  })
})

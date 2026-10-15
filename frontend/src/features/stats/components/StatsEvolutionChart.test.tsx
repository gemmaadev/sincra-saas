import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { StatsEvolutionChart } from './StatsEvolutionChart'

// jsdom has no real <canvas> context, and disposing a real ECharts instance between tests
// throws async errors that can fail unrelated tests. We only need to check that our component
// passes the right data — rendering the chart itself is echarts-for-react's own job.
vi.mock('echarts-for-react', () => ({
  default: () => <div data-testid="echarts-mock" />,
}))

function renderChart(props: React.ComponentProps<typeof StatsEvolutionChart>) {
  return render(
    <MantineProvider>
      <StatsEvolutionChart {...props} />
    </MantineProvider>,
  )
}

describe('StatsEvolutionChart', () => {
  // Given no data points
  // When the chart is rendered
  // Then it should show an empty message instead of an empty chart
  it('shows an empty message when there is no data', () => {
    render(<StatsEvolutionChart data={[]} granularity="daily" onGranularityChange={vi.fn()} />)

    expect(screen.getByText('Evolución de pedidos')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay pedidos en este periodo.')).toBeInTheDocument()
  })

  // Given data points
  // When the chart is rendered
  // Then it should show the title and not the empty message
  it('renders the chart title when there is data', () => {
    render(
      <StatsEvolutionChart
        data={[
          { label: '1 oct', value: 3 },
          { label: '2 oct', value: 5 },
        ]}
        granularity="daily"
        onGranularityChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Evolución de pedidos')).toBeInTheDocument()
    expect(
      screen.queryByText('Todavía no hay pedidos en este periodo.'),
    ).not.toBeInTheDocument()
  })

  // Given the chart is rendered
  // When the user switches to weekly
  // Then onGranularityChange should receive "weekly"
  it('reports a granularity change from the toggle', () => {
    const onGranularityChange = vi.fn()
    render(
      <StatsEvolutionChart data={[]} granularity="daily" onGranularityChange={onGranularityChange} />,
    )

    screen.getByRole('button', { name: 'Semanal' }).click()

    expect(onGranularityChange).toHaveBeenCalledWith('weekly')
  })

  // Given an infoTooltip prop
  // When the chart is rendered
  // Then an info icon should appear next to the title
  it('shows an info icon next to the title when infoTooltip is given', () => {
    const { container } = renderChart({
      data: [],
      granularity: 'daily',
      onGranularityChange: vi.fn(),
      infoTooltip: 'Cuenta todos los pedidos creados en el rango, sin importar su estado.',
    })

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})

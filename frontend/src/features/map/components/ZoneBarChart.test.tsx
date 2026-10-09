import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ZoneBarChart } from './ZoneBarChart'

// jsdom has no real <canvas> context, and disposing a real ECharts instance between tests
// throws async errors that can fail unrelated tests. We only need to check that our component
// passes the right title/data — rendering the chart itself is echarts-for-react's own job.
vi.mock('echarts-for-react', () => ({
  default: () => <div data-testid="echarts-mock" />,
}))

describe('ZoneBarChart', () => {
  // Given no zones with revenue
  // When the chart is rendered
  // Then it should show an empty message instead of an empty chart
  it('shows an empty message when there is no data', () => {
    render(<ZoneBarChart title="Ingresos por zona" data={[]} />)

    expect(screen.getByText('Ingresos por zona')).toBeInTheDocument()
    expect(
      screen.getByText('Todavía no hay pedidos entregados en ninguna zona.'),
    ).toBeInTheDocument()
  })

  // Given zones with revenue
  // When the chart is rendered
  // Then it should show the title and not the empty message
  it('renders the chart title when there is data', () => {
    render(
      <ZoneBarChart
        title="Ticket medio por zona"
        data={[
          { zone: 'Bilbao', value: 50 },
          { zone: 'Vic', value: 20 },
        ]}
      />,
    )

    expect(screen.getByText('Ticket medio por zona')).toBeInTheDocument()
    expect(
      screen.queryByText('Todavía no hay pedidos entregados en ninguna zona.'),
    ).not.toBeInTheDocument()
  })
})

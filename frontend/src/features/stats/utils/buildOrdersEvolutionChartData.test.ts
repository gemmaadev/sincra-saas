import { describe, it, expect } from 'vitest'
import { buildOrdersEvolutionChartData } from './buildOrdersEvolutionChartData'

describe('buildOrdersEvolutionChartData', () => {
  // Given evolution points with ISO dates
  // When building the chart data
  // Then each point should get a short "day month" label, with its count as the value
  it('formats each point as a short date label with its count', () => {
    const data = buildOrdersEvolutionChartData({
      granularity: 'daily',
      points: [
        { date: '2026-10-01', count: 3 },
        { date: '2026-10-02', count: 0 },
      ],
    })

    expect(data).toEqual([
      { label: '1 oct', value: 3 },
      { label: '2 oct', value: 0 },
    ])
  })

  // Given no points at all
  // When building the chart data
  // Then it should return an empty list
  it('returns an empty list when there are no points', () => {
    const data = buildOrdersEvolutionChartData({ granularity: 'daily', points: [] })

    expect(data).toEqual([])
  })
})

import { describe, it, expect } from 'vitest'
import { buildRevenueByZone, buildAverageTicketByZone } from './buildZoneChartData'
import type { OrderMapZoneSummary } from '../types/map.types'

const zones: OrderMapZoneSummary[] = [
  { zone: 'Bilbao', count: 2, revenue: '100', percentage: 66.7 },
  { zone: 'Vic', count: 1, revenue: '20', percentage: 33.3 },
]

describe('buildRevenueByZone', () => {
  // Given a list of zones with their revenue
  // When it is turned into chart points
  // Then each point should keep the zone name and the revenue as a number
  it('maps each zone to its revenue as a number', () => {
    expect(buildRevenueByZone(zones)).toEqual([
      { zone: 'Bilbao', value: 100 },
      { zone: 'Vic', value: 20 },
    ])
  })

  // Given no zones
  // When it is turned into chart points
  // Then the result should be empty
  it('returns an empty list for no zones', () => {
    expect(buildRevenueByZone([])).toEqual([])
  })
})

describe('buildAverageTicketByZone', () => {
  // Given a zone with 2 delivered orders totalling 100
  // When it is turned into chart points
  // Then its value should be the average ticket (revenue / count)
  it('divides the revenue by the order count', () => {
    expect(buildAverageTicketByZone(zones)).toEqual([
      { zone: 'Bilbao', value: 50 },
      { zone: 'Vic', value: 20 },
    ])
  })
})

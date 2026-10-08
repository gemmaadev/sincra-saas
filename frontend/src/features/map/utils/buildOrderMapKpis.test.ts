import { describe, it, expect } from 'vitest'
import { buildOrderMapKpis, toOrderKpiCards } from './buildOrderMapKpis'
import type { OrderMapResponse } from '../types/map.types'

describe('buildOrderMapKpis', () => {
  // Given a response with two zones, already sorted by revenue (Bilbao first)
  // When the KPIs are built
  // Then it should take the total, the zone count, the revenue and the top zone as-is
  it('summarises total orders, zones with sales, revenue and the top zone', () => {
    const data: OrderMapResponse = {
      total: 5,
      deliveredRevenue: '150.5',
      zones: [
        { zone: 'Bilbao', count: 1, revenue: '100', percentage: 50 },
        { zone: 'Manresa', count: 2, revenue: '50.5', percentage: 50 },
      ],
    }

    expect(buildOrderMapKpis(data)).toEqual({
      totalOrders: 5,
      zonesWithSales: 2,
      deliveredRevenue: 150.5,
      topRevenueZone: 'Bilbao',
    })
  })

  // Given no orders at all
  // When the KPIs are built
  // Then everything should be zero and there should be no top zone
  it('returns empty KPIs when there are no orders', () => {
    expect(buildOrderMapKpis({ total: 0, deliveredRevenue: '0', zones: [] })).toEqual({
      totalOrders: 0,
      zonesWithSales: 0,
      deliveredRevenue: 0,
      topRevenueZone: null,
    })
  })
})

describe('toOrderKpiCards', () => {
  // Given a set of order map KPIs
  // When they are turned into card specs
  // Then there should be exactly 4 cards, with the revenue formatted as currency
  it('builds 4 cards with the KPI values', () => {
    const cards = toOrderKpiCards({
      totalOrders: 24,
      zonesWithSales: 6,
      deliveredRevenue: 234.5,
      topRevenueZone: 'Bilbao',
    })

    expect(cards).toHaveLength(4)
    expect(cards.map((card) => card.label)).toEqual([
      'Pedidos en el mapa',
      'Zonas con ventas',
      'Ingresos totales',
      'Zona con más ingresos',
    ])
    expect(cards.map((card) => card.value)).toEqual(['24', '6', '234,50 €', 'Bilbao'])
    expect(cards.every((card) => !card.pending)).toBe(true)
  })

  // Given the order map data has not loaded yet (kpis is null)
  // When it is turned into card specs
  // Then it should still return 4 cards, marked as pending, instead of nothing
  it('returns 4 pending cards while the data is loading, instead of none', () => {
    const cards = toOrderKpiCards(null)

    expect(cards).toHaveLength(4)
    expect(cards.every((card) => card.pending)).toBe(true)
  })
})

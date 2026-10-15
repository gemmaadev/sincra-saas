import { describe, it, expect } from 'vitest'
import { buildStatsKpiCards } from './buildStatsKpiCards'

describe('buildStatsKpiCards', () => {
  // Given no overview yet (still loading)
  // When building the KPI cards
  // Then all four cards should be pending, with no value
  it('returns four pending cards when there is no overview', () => {
    const cards = buildStatsKpiCards(null)

    expect(cards).toHaveLength(4)
    expect(cards.every((card) => card.pending)).toBe(true)
  })

  // Given a loaded overview
  // When building the KPI cards
  // Then each should show its formatted value
  it('formats each KPI from the overview', () => {
    const cards = buildStatsKpiCards({
      newClients: 5,
      ordersCreated: 12,
      averageDeliveryDays: 2.5,
      revenue: '150',
    })

    expect(cards).toEqual([
      expect.objectContaining({ label: 'Clientes nuevos', value: '5' }),
      expect.objectContaining({ label: 'Pedidos generados', value: '12' }),
      expect.objectContaining({ label: 'Tiempo medio hasta entrega', value: '2.5 días' }),
      expect.objectContaining({ label: 'Ingresos', value: '150,00\xa0€' }),
    ])
  })

  // Given an overview with no delivered orders yet
  // When building the KPI cards
  // Then the average delivery time should show a dash, not "null días"
  it('shows a dash for average delivery time when there are no delivered orders', () => {
    const cards = buildStatsKpiCards({
      newClients: 0,
      ordersCreated: 0,
      averageDeliveryDays: null,
      revenue: '0',
    })

    expect(cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Tiempo medio hasta entrega', value: '—' }),
      ]),
    )
  })

  // Given a loaded overview
  // When building the KPI cards
  // Then the ambiguous ones (average delivery time, revenue) should explain their scope
  it('adds an info tooltip to the ambiguous KPIs', () => {
    const cards = buildStatsKpiCards({
      newClients: 5,
      ordersCreated: 12,
      averageDeliveryDays: 2.5,
      revenue: '150',
    })

    expect(cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Tiempo medio hasta entrega',
          infoTooltip: expect.any(String),
        }),
        expect.objectContaining({ label: 'Ingresos', infoTooltip: expect.any(String) }),
      ]),
    )
  })
})

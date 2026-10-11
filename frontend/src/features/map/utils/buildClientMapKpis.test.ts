import { describe, it, expect } from 'vitest'
import { buildClientMapKpis, toClientKpiCards } from './buildClientMapKpis'
import type { ClientMapResponse, MapClient } from '../types/map.types'

function mapClient(id: string, approximate = false): MapClient {
  return {
    id,
    name: `Cliente ${id}`,
    latitude: 41.4,
    longitude: 2.1,
    zone: 'Barcelona',
    channels: [],
    type: null,
    approximate,
    orderCount: 0,
    deliveredRevenue: '0',
  }
}

describe('buildClientMapKpis', () => {
  // Given clients in two zones plus some without zone, already sorted by size
  // When the KPIs are built
  // Then it should count clients, real zones (not "Sin zona"), the top zone and approximate clients
  it('summarises clients, zones, top zone and approximate clients', () => {
    const data: ClientMapResponse = {
      total: 4,
      clients: [mapClient('1'), mapClient('2'), mapClient('3', true), mapClient('4')],
      zones: [
        { zone: 'Barcelona', count: 2, percentage: 50 },
        { zone: 'Sabadell', count: 1, percentage: 25 },
        { zone: 'Sin zona', count: 1, percentage: 25 },
      ],
      channelOrigin: [],
    }

    expect(buildClientMapKpis(data)).toEqual({
      clientsOnMap: 4,
      activeZones: 2,
      topZone: 'Barcelona',
      approximateClients: 1,
    })
  })

  // Given no clients at all
  // When the KPIs are built
  // Then everything should be zero and there should be no top zone
  it('returns empty KPIs when there are no clients', () => {
    expect(buildClientMapKpis({ total: 0, clients: [], zones: [], channelOrigin: [] })).toEqual({
      clientsOnMap: 0,
      activeZones: 0,
      topZone: null,
      approximateClients: 0,
    })
  })

  // Given every client without a zone
  // When the KPIs are built
  // Then "Sin zona" should not count as an active zone or as the top zone
  it('ignores the "Sin zona" group', () => {
    const data: ClientMapResponse = {
      total: 1,
      clients: [mapClient('1')],
      zones: [{ zone: 'Sin zona', count: 1, percentage: 100 }],
      channelOrigin: [],
    }

    const kpis = buildClientMapKpis(data)

    expect(kpis.activeZones).toBe(0)
    expect(kpis.topZone).toBeNull()
  })
})

describe('toClientKpiCards', () => {
  // Given a set of client map KPIs
  // When they are turned into card specs
  // Then there should be exactly 4 cards, with the top zone's name as the value
  it('builds 4 cards with the KPI values', () => {
    const cards = toClientKpiCards({
      clientsOnMap: 12,
      activeZones: 5,
      topZone: 'Barcelona',
      approximateClients: 2,
    })

    expect(cards).toHaveLength(4)
    expect(cards.map((card) => card.label)).toEqual([
      'Clientes en el mapa',
      'Zonas activas',
      'Zona principal',
      'Sin ubicación exacta',
    ])
    expect(cards.map((card) => card.value)).toEqual(['12', '5', 'Barcelona', '2'])
  })

  // Given there is no top zone
  // When the KPIs are turned into card specs
  // Then the top zone card should show a dash
  it('shows a dash when there is no top zone', () => {
    const cards = toClientKpiCards({
      clientsOnMap: 0,
      activeZones: 0,
      topZone: null,
      approximateClients: 0,
    })

    expect(cards[2].value).toBe('—')
  })

  // Given the client map data has not loaded yet (kpis is null)
  // When it is turned into card specs
  // Then it should still return 4 cards, marked as pending, instead of none
  it('returns 4 pending cards while the data is loading, instead of none', () => {
    const cards = toClientKpiCards(null)

    expect(cards).toHaveLength(4)
    expect(cards.every((card) => card.pending)).toBe(true)
  })
})

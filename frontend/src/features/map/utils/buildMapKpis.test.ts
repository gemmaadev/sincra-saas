import { describe, it, expect } from 'vitest'
import { buildMapKpis } from './buildMapKpis'
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

describe('buildMapKpis', () => {
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

    expect(buildMapKpis(data)).toEqual({
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
    expect(buildMapKpis({ total: 0, clients: [], zones: [], channelOrigin: [] })).toEqual({
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

    const kpis = buildMapKpis(data)

    expect(kpis.activeZones).toBe(0)
    expect(kpis.topZone).toBeNull()
  })
})

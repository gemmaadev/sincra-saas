import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clientMapModel from './client-map.model'
import type { ClientMapRecord } from './client-map.types'
import {
  buildZoneSummary,
  buildChannelOrigin,
  computeZoneCentroids,
  buildMapClients,
  getClientMap,
} from './client-map.service'

vi.mock('./client-map.model')

function record(overrides: Partial<ClientMapRecord> = {}): ClientMapRecord {
  return {
    id: 'client-1',
    name: 'Laura García',
    latitude: null,
    longitude: null,
    zone: null,
    address: null,
    channels: [],
    type: null,
    ...overrides,
  }
}

describe('buildZoneSummary', () => {
  // Given no clients
  // When the zone summary is built
  // Then it should be empty
  it('returns an empty list for no clients', () => {
    expect(buildZoneSummary([])).toEqual([])
  })

  // Given clients in different zones
  // When the zone summary is built
  // Then each zone should have its count and its percentage of the total
  it('counts the clients of each zone with their percentage', () => {
    const summary = buildZoneSummary([
      record({ zone: 'Barcelona' }),
      record({ zone: 'Barcelona' }),
      record({ zone: 'Barcelona' }),
      record({ zone: 'Girona' }),
    ])

    expect(summary).toEqual([
      { zone: 'Barcelona', count: 3, percentage: 75 },
      { zone: 'Girona', count: 1, percentage: 25 },
    ])
  })

  // Given clients without a zone, with an empty zone or with only spaces
  // When the zone summary is built
  // Then they should be grouped as "Sin zona" and still count in the total
  it('groups clients without a zone as "Sin zona"', () => {
    const summary = buildZoneSummary([
      record({ zone: null }),
      record({ zone: '' }),
      record({ zone: '   ' }),
      record({ zone: 'Vic' }),
    ])

    expect(summary).toEqual([
      { zone: 'Sin zona', count: 3, percentage: 75 },
      { zone: 'Vic', count: 1, percentage: 25 },
    ])
  })

  // Given the same zone written with different case or spaces
  // When the zone summary is built
  // Then they should be one zone, keeping the first spelling
  it('groups zones ignoring case and surrounding spaces', () => {
    const summary = buildZoneSummary([
      record({ zone: 'Barcelona' }),
      record({ zone: ' barcelona ' }),
      record({ zone: 'BARCELONA' }),
    ])

    expect(summary).toEqual([{ zone: 'Barcelona', count: 3, percentage: 100 }])
  })

  // Given zones with the same number of clients
  // When the zone summary is built
  // Then the biggest zones come first and ties are ordered by name
  it('orders by count and then by name', () => {
    const summary = buildZoneSummary([
      record({ zone: 'Vic' }),
      record({ zone: 'Girona' }),
      record({ zone: 'Barcelona' }),
      record({ zone: 'Barcelona' }),
    ])

    expect(summary.map((zone) => zone.zone)).toEqual(['Barcelona', 'Girona', 'Vic'])
  })

  // Given a total that does not divide evenly
  // When the zone summary is built
  // Then percentages should be rounded to one decimal
  it('rounds the percentage to one decimal', () => {
    const summary = buildZoneSummary([
      record({ zone: 'A' }),
      record({ zone: 'B' }),
      record({ zone: 'C' }),
    ])

    expect(summary.map((zone) => zone.percentage)).toEqual([33.3, 33.3, 33.3])
  })
})

describe('buildChannelOrigin', () => {
  // Given no clients
  // When the channel origin is built
  // Then it should be empty
  it('returns an empty list for no clients', () => {
    expect(buildChannelOrigin([])).toEqual([])
  })

  // Given a client with two channels
  // When the channel origin is built
  // Then the client should count once in each of its channels
  it('counts a client in each of its channels', () => {
    const origin = buildChannelOrigin([
      record({ channels: ['GMAIL', 'WHATSAPP'] }),
      record({ channels: ['GMAIL'] }),
    ])

    expect(origin).toEqual([
      { channel: 'GMAIL', count: 2, percentage: 66.7 },
      { channel: 'WHATSAPP', count: 1, percentage: 33.3 },
    ])
  })

  // Given clients without any channel
  // When the channel origin is built
  // Then they should not add anything
  it('ignores clients without channels', () => {
    const origin = buildChannelOrigin([record({ channels: [] }), record({ channels: ['OUTLOOK'] })])

    expect(origin).toEqual([{ channel: 'OUTLOOK', count: 1, percentage: 100 }])
  })

  // Given channels with the same count
  // When the channel origin is built
  // Then the biggest comes first and ties are ordered by channel name
  it('orders by count and then by channel name', () => {
    const origin = buildChannelOrigin([
      record({ channels: ['WHATSAPP'] }),
      record({ channels: ['GMAIL'] }),
      record({ channels: ['GMAIL'] }),
      record({ channels: ['INSTAGRAM'] }),
    ])

    expect(origin.map((share) => share.channel)).toEqual(['GMAIL', 'INSTAGRAM', 'WHATSAPP'])
  })
})

describe('computeZoneCentroids', () => {
  // Given clients with coordinates in the same zone
  // When the centroids are computed
  // Then the zone should be the average of their coordinates
  it('averages the coordinates of the clients of each zone', () => {
    const centroids = computeZoneCentroids([
      record({ zone: 'Barcelona', latitude: 41, longitude: 2 }),
      record({ zone: 'Barcelona', latitude: 43, longitude: 4 }),
      record({ zone: 'Girona', latitude: 42, longitude: 3 }),
    ])

    expect(centroids.get('barcelona')).toEqual({ latitude: 42, longitude: 3 })
    expect(centroids.get('girona')).toEqual({ latitude: 42, longitude: 3 })
  })

  // Given the same zone written with different case
  // When the centroids are computed
  // Then they should be one zone
  it('treats zones with different case as the same zone', () => {
    const centroids = computeZoneCentroids([
      record({ zone: 'Barcelona', latitude: 41, longitude: 2 }),
      record({ zone: ' BARCELONA ', latitude: 43, longitude: 4 }),
    ])

    expect(centroids.size).toBe(1)
    expect(centroids.get('barcelona')).toEqual({ latitude: 42, longitude: 3 })
  })

  // Given clients without zone or with a missing coordinate
  // When the centroids are computed
  // Then they should not contribute
  it('ignores clients without a zone or without both coordinates', () => {
    const centroids = computeZoneCentroids([
      record({ zone: null, latitude: 41, longitude: 2 }),
      record({ zone: 'Vic', latitude: 41, longitude: null }),
      record({ zone: 'Vic', latitude: null, longitude: null }),
    ])

    expect(centroids.size).toBe(0)
  })

  // Given coordinates that do not average to a short number
  // When the centroids are computed
  // Then they should be rounded to 6 decimals
  it('rounds the centroid to 6 decimals', () => {
    const centroids = computeZoneCentroids([
      record({ zone: 'A', latitude: 41.1234567, longitude: 2 }),
      record({ zone: 'A', latitude: 41.1234568, longitude: 2 }),
      record({ zone: 'A', latitude: 41.1234568, longitude: 2 }),
    ])

    expect(centroids.get('a')?.latitude).toBe(41.123457)
  })
})

describe('buildMapClients', () => {
  const centroids = new Map([['barcelona', { latitude: 41.4, longitude: 2.2 }]])

  // Given a client with coordinates and an address
  // When the map clients are built
  // Then it should keep the coordinates and not be marked as approximate
  it('keeps the coordinates of a client with an address as exact', () => {
    const [mapClient] = buildMapClients(
      [
        record({
          id: 'a',
          zone: 'Barcelona',
          address: 'Carrer de Balmes 71',
          latitude: 41.5,
          longitude: 2.1,
        }),
      ],
      centroids,
    )

    expect(mapClient).toMatchObject({ id: 'a', latitude: 41.5, longitude: 2.1, approximate: false })
  })

  // Given a client with coordinates but no address (e.g. geocoded from its zone only)
  // When the map clients are built
  // Then it should keep its coordinates but be marked as approximate
  it.each([
    ['no address', null],
    ['an empty address', ''],
    ['an address with only spaces', '   '],
  ])('marks a client with coordinates and %s as approximate', (_label, address) => {
    const [mapClient] = buildMapClients(
      [record({ id: 'a', zone: 'Barcelona', address, latitude: 41.5, longitude: 2.1 })],
      centroids,
    )

    expect(mapClient).toMatchObject({ id: 'a', latitude: 41.5, longitude: 2.1, approximate: true })
  })

  // Given a client with an address
  // When the map clients are built
  // Then the address itself should not be part of the map response
  it('does not expose the address in the map response', () => {
    const [mapClient] = buildMapClients(
      [record({ address: 'Carrer de Balmes 71', latitude: 41.5, longitude: 2.1 })],
      centroids,
    )

    expect(mapClient).not.toHaveProperty('address')
  })

  // Given a client without coordinates but in a zone with a centroid
  // When the map clients are built
  // Then it should be placed at the zone centroid and marked as approximate
  it('places a client without coordinates at the centroid of its zone', () => {
    const [mapClient] = buildMapClients([record({ id: 'b', zone: ' barcelona ' })], centroids)

    expect(mapClient).toMatchObject({
      id: 'b',
      latitude: 41.4,
      longitude: 2.2,
      approximate: true,
    })
  })

  // Given clients that cannot be placed
  // When the map clients are built
  // Then they should be left out of the map
  it('leaves out clients without coordinates and without a known zone', () => {
    const mapClients = buildMapClients(
      [record({ id: 'c', zone: 'Vic' }), record({ id: 'd', zone: null })],
      centroids,
    )

    expect(mapClients).toEqual([])
  })

  // Given a client with only one coordinate
  // When the map clients are built
  // Then it should be treated as having none
  it('treats a client with only one coordinate as having none', () => {
    const [mapClient] = buildMapClients(
      [record({ zone: 'Barcelona', latitude: 41.5, longitude: null })],
      centroids,
    )

    expect(mapClient.approximate).toBe(true)
  })

  // Given clients in a given order
  // When the map clients are built
  // Then the order should be preserved
  it('keeps the order of the clients', () => {
    const mapClients = buildMapClients(
      [
        record({ id: 'first', latitude: 1, longitude: 1 }),
        record({ id: 'second', latitude: 2, longitude: 2 }),
      ],
      centroids,
    )

    expect(mapClients.map((mapClient) => mapClient.id)).toEqual(['first', 'second'])
  })
})

describe('getClientMap', () => {
  beforeEach(() => vi.resetAllMocks())

  // Given a business with clients, some of them without coordinates
  // When the map is requested with filters
  // Then it should combine the points, the zone summary and the channel donut
  it('combines the clients, the zones and the channel origin', async () => {
    vi.mocked(clientMapModel.findClientsForMap).mockResolvedValue([
      record({
        id: 'a',
        zone: 'Barcelona',
        address: 'Carrer Major 1',
        latitude: 41,
        longitude: 2,
        channels: ['GMAIL'],
      }),
      record({ id: 'b', zone: 'Barcelona', channels: ['GMAIL', 'WHATSAPP'] }),
      record({ id: 'c', zone: null, channels: [] }),
    ])
    vi.mocked(clientMapModel.findZoneCoordinates).mockResolvedValue([
      { zone: 'Barcelona', latitude: 41, longitude: 2 },
    ])

    const result = await getClientMap('business-1', { channel: 'GMAIL' })

    expect(result.total).toBe(3)
    expect(result.clients).toEqual([
      expect.objectContaining({ id: 'a', approximate: false }),
      expect.objectContaining({ id: 'b', latitude: 41, longitude: 2, approximate: true }),
    ])
    expect(result.zones).toEqual([
      { zone: 'Barcelona', count: 2, percentage: 66.7 },
      { zone: 'Sin zona', count: 1, percentage: 33.3 },
    ])
    expect(result.channelOrigin.map((share) => share.channel)).toEqual(['GMAIL', 'WHATSAPP'])
  })

  // Given map filters
  // When the map is requested
  // Then the filters should apply to the clients but not to the zone coordinates
  it('applies the filters to the clients but not to the zone coordinates', async () => {
    vi.mocked(clientMapModel.findClientsForMap).mockResolvedValue([])
    vi.mocked(clientMapModel.findZoneCoordinates).mockResolvedValue([])
    const filters = { channel: 'GMAIL' as const, type: 'empresa' }

    await getClientMap('business-1', filters)

    expect(clientMapModel.findClientsForMap).toHaveBeenCalledWith('business-1', filters)
    expect(clientMapModel.findZoneCoordinates).toHaveBeenCalledWith('business-1')
  })

  // Given a business without clients
  // When the map is requested
  // Then every part should be empty
  it('returns an empty map when there are no clients', async () => {
    vi.mocked(clientMapModel.findClientsForMap).mockResolvedValue([])
    vi.mocked(clientMapModel.findZoneCoordinates).mockResolvedValue([])

    expect(await getClientMap('business-1', {})).toEqual({
      total: 0,
      clients: [],
      zones: [],
      channelOrigin: [],
    })
  })
})

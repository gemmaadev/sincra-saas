import { describe, it, expect } from 'vitest'
import type { ClientMapRecord } from './client-map.types'
import { buildZoneSummary, buildChannelOrigin } from './client-map.service'

function record(overrides: Partial<ClientMapRecord> = {}): ClientMapRecord {
  return {
    id: 'client-1',
    name: 'Laura García',
    latitude: null,
    longitude: null,
    zone: null,
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

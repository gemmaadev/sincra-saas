import { describe, it, expect } from 'vitest'
import { getZonePositions } from './getZonePositions'
import type { MapClient } from '../types/map.types'

function mapClient(id: string, zone: string | null, latitude: number): MapClient {
  return {
    id,
    name: `Cliente ${id}`,
    latitude,
    longitude: 2,
    zone,
    channels: [],
    type: null,
    approximate: false,
  }
}

describe('getZonePositions', () => {
  const clients = [
    mapClient('1', 'Manresa', 41.7),
    mapClient('2', 'Vic', 41.9),
    mapClient('3', ' Manresa ', 41.72),
    mapClient('4', null, 41.1),
  ]

  // Given clients in several zones
  // When the positions of one zone are requested
  // Then only the clients of that zone should be returned, ignoring stray spaces
  it('returns the positions of the clients in that zone', () => {
    expect(getZonePositions(clients, 'Manresa')).toEqual([
      [41.7, 2],
      [41.72, 2],
    ])
  })

  // Given clients without a zone
  // When the "Sin zona" group is requested
  // Then the clients without zone should be returned
  it('returns the clients without a zone for the "Sin zona" group', () => {
    expect(getZonePositions(clients, 'Sin zona')).toEqual([[41.1, 2]])
  })

  // Given a zone nobody belongs to
  // When its positions are requested
  // Then the result should be empty
  it('returns nothing for an unknown zone', () => {
    expect(getZonePositions(clients, 'Girona')).toEqual([])
  })
})

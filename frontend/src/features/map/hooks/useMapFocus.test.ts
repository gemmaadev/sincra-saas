import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useMapFocus } from './useMapFocus'
import type { MapClient } from '../types/map.types'

function mapClient(id: string, zone: string, latitude: number): MapClient {
  return {
    id,
    name: `Cliente ${id}`,
    latitude,
    longitude: 2,
    zone,
    channels: [],
    type: null,
    approximate: false,
    orderCount: 0,
    deliveredRevenue: '0',
  }
}

const clients = [mapClient('1', 'Manresa', 41.7), mapClient('2', 'Vic', 41.9)]

describe('useMapFocus', () => {
  // Given the first load of the map
  // When the clients arrive
  // Then nothing should be focused, because the map already fits them when it is created
  it('does not focus anything on the first load', () => {
    const { result } = renderHook(() => useMapFocus(clients, '{}', false))

    expect(result.current.focusedPositions).toBeNull()
  })

  // Given a zone of the summary
  // When it is focused
  // Then only the positions of its clients should be focused
  it('focuses the positions of a zone', () => {
    const { result } = renderHook(() => useMapFocus(clients, '{}', false))

    act(() => result.current.focusZone('Manresa'))

    expect(result.current.focusedPositions).toEqual([[41.7, 2]])
  })

  // Given the filters change and the new clients arrive
  // When the data is no longer the previous placeholder
  // Then all the new clients should be focused
  it('refits the map on every client when the filters change', () => {
    const { result, rerender } = renderHook(
      ({ filtersKey, isPlaceholderData }) => useMapFocus(clients, filtersKey, isPlaceholderData),
      { initialProps: { filtersKey: '{}', isPlaceholderData: false } },
    )

    rerender({ filtersKey: '{"channel":"GMAIL"}', isPlaceholderData: false })

    expect(result.current.focusedPositions).toEqual([
      [41.7, 2],
      [41.9, 2],
    ])
  })

  // Given the filters changed but the data on screen is still the previous one
  // When the hook runs
  // Then it should wait for the new data before refitting
  it('waits for the new data before refitting', () => {
    const { result, rerender } = renderHook(
      ({ filtersKey, isPlaceholderData }) => useMapFocus(clients, filtersKey, isPlaceholderData),
      { initialProps: { filtersKey: '{}', isPlaceholderData: false } },
    )

    rerender({ filtersKey: '{"channel":"GMAIL"}', isPlaceholderData: true })

    expect(result.current.focusedPositions).toBeNull()
  })

  // Given the same filters
  // When the clients are refreshed (e.g. after editing one)
  // Then the map should not be refitted
  it('does not refit when the clients refresh with the same filters', () => {
    const { result, rerender } = renderHook(({ list }) => useMapFocus(list, '{}', false), {
      initialProps: { list: clients },
    })

    rerender({ list: [...clients, mapClient('3', 'Girona', 42)] })

    expect(result.current.focusedPositions).toBeNull()
  })
})

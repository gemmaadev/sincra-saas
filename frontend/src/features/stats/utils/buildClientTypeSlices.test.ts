import { describe, it, expect } from 'vitest'
import { buildClientTypeSlices } from './buildClientTypeSlices'

describe('buildClientTypeSlices', () => {
  // Given client types already sorted by count descending
  // When building the donut slices
  // Then each should get a color from the palette, cycling by position
  it('assigns palette colors by position', () => {
    const slices = buildClientTypeSlices({
      total: 10,
      types: [
        { type: 'empresa', count: 6, percentage: 60 },
        { type: 'particular', count: 4, percentage: 40 },
      ],
    })

    expect(slices).toEqual([
      { label: 'empresa', value: 6, percentage: 60, color: '#1e5eff' },
      { label: 'particular', value: 4, percentage: 40, color: '#3fa65c' },
    ])
  })

  // Given no clients at all
  // When building the donut slices
  // Then it should return an empty list
  it('returns an empty list when there are no clients', () => {
    const slices = buildClientTypeSlices({ total: 0, types: [] })

    expect(slices).toEqual([])
  })
})

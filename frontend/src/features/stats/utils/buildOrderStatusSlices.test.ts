import { describe, it, expect } from 'vitest'
import { buildOrderStatusSlices } from './buildOrderStatusSlices'

describe('buildOrderStatusSlices', () => {
  // Given a mix of zero-count and real statuses
  // When building the donut slices
  // Then only the non-zero statuses should appear, labeled in Spanish
  it('excludes zero-count statuses and uses Spanish labels', () => {
    const slices = buildOrderStatusSlices({
      total: 10,
      statuses: [
        { status: 'PENDING', count: 3, percentage: 30 },
        { status: 'PREPARING', count: 0, percentage: 0 },
        { status: 'SHIPPED', count: 0, percentage: 0 },
        { status: 'DELIVERED', count: 6, percentage: 60 },
        { status: 'CANCELLED', count: 1, percentage: 10 },
      ],
    })

    expect(slices).toEqual([
      { label: 'Pendiente', value: 3, percentage: 30, color: '#94a3b8' },
      { label: 'Entregado', value: 6, percentage: 60, color: '#3fa65c' },
      { label: 'Cancelado', value: 1, percentage: 10, color: '#e5484d' },
    ])
  })

  // Given no orders at all
  // When building the donut slices
  // Then it should return an empty list
  it('returns an empty list when there are no orders', () => {
    const slices = buildOrderStatusSlices({
      total: 0,
      statuses: [
        { status: 'PENDING', count: 0, percentage: 0 },
        { status: 'PREPARING', count: 0, percentage: 0 },
        { status: 'SHIPPED', count: 0, percentage: 0 },
        { status: 'DELIVERED', count: 0, percentage: 0 },
        { status: 'CANCELLED', count: 0, percentage: 0 },
      ],
    })

    expect(slices).toEqual([])
  })
})

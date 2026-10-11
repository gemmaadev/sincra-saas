/// <reference types="leaflet.markercluster" />
import { describe, it, expect } from 'vitest'
import type { MarkerCluster } from 'leaflet'
import { createClusterIcon } from './createClusterIcon'

function fakeCluster(childCount: number): MarkerCluster {
  return { getChildCount: () => childCount } as MarkerCluster
}

describe('createClusterIcon', () => {
  // Given a cluster that groups 12 markers
  // When its icon is created
  // Then the icon should show the number 12
  it('shows how many markers the cluster groups', () => {
    const icon = createClusterIcon(fakeCluster(12), 'bg-primary')

    expect(icon.options.html).toContain('>12<')
  })

  // Given a colour class name
  // When a cluster icon is created
  // Then it should use that colour instead of the library default
  it('uses the given colour', () => {
    const icon = createClusterIcon(fakeCluster(3), 'bg-primary')

    expect(icon.options.html).toContain('bg-primary')
    expect(icon.options.className).toBe('client-cluster')
  })

  // Given the order cluster colour
  // When a cluster icon is created
  // Then it should use that colour instead of the client one
  it('uses a different colour for order clusters', () => {
    const icon = createClusterIcon(fakeCluster(3), 'bg-primary-dark')

    expect(icon.options.html).toContain('bg-primary-dark')
  })
})

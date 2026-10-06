/// <reference types="leaflet.markercluster" />
import { describe, it, expect } from 'vitest'
import type { MarkerCluster } from 'leaflet'
import { createClusterIcon } from './createClusterIcon'

function fakeCluster(childCount: number): MarkerCluster {
  return { getChildCount: () => childCount } as MarkerCluster
}

describe('createClusterIcon', () => {
  // Given a cluster that groups 12 clients
  // When its icon is created
  // Then the icon should show the number 12
  it('shows how many clients the cluster groups', () => {
    const icon = createClusterIcon(fakeCluster(12))

    expect(icon.options.html).toContain('>12<')
  })

  // Given any cluster
  // When its icon is created
  // Then it should use the project primary colour instead of the library default
  it('uses the primary colour', () => {
    const icon = createClusterIcon(fakeCluster(3))

    expect(icon.options.html).toContain('bg-primary')
    expect(icon.options.className).toBe('client-cluster')
  })
})

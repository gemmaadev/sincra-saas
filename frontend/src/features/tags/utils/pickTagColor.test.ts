import { describe, it, expect } from 'vitest'
import { pickTagColor, TAG_COLOR_PALETTE } from './pickTagColor'
import type { Tag } from '../types/tag.types'

function tagWithColor(color: string): Tag {
  return { id: color, name: color, color, priority: 'LOW', isDefault: false }
}

describe('pickTagColor', () => {
  // Given an empty catalog
  // When a color is picked
  // Then it should be the first color of the palette
  it('returns the first palette color when no tag exists', () => {
    expect(pickTagColor([])).toBe(TAG_COLOR_PALETTE[0])
  })

  // Given the first palette colors are already used by other tags
  // When a color is picked
  // Then it should be the first color that is not used yet, whatever its letter case
  it('skips the colors that are already used', () => {
    const tags = [
      tagWithColor(TAG_COLOR_PALETTE[0].toUpperCase()),
      tagWithColor(TAG_COLOR_PALETTE[1]),
    ]

    expect(pickTagColor(tags)).toBe(TAG_COLOR_PALETTE[2])
  })

  // Given every palette color is used
  // When a color is picked
  // Then it should still return a palette color instead of failing
  it('reuses the palette when every color is taken', () => {
    const tags = TAG_COLOR_PALETTE.map(tagWithColor)

    expect(TAG_COLOR_PALETTE).toContain(pickTagColor(tags))
  })
})

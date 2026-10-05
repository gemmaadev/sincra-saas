import type { Tag } from '../types/tag.types'

export const TAG_COLOR_PALETTE = [
  '#3b91ff',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#64748b',
  '#84cc16',
  '#06b6d4',
] as const

export function pickTagColor(existingTags: Tag[]): string {
  const usedColors = new Set(existingTags.map((tag) => tag.color.toLowerCase()))
  const unusedColor = TAG_COLOR_PALETTE.find((color) => !usedColors.has(color))

  return unusedColor ?? TAG_COLOR_PALETTE[existingTags.length % TAG_COLOR_PALETTE.length]
}

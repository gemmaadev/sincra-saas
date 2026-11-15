import { AiSuggestedBadge } from '@/shared/components/badge/AiSuggestedBadge'
import type { TagPillProps } from './tag-pill.types'

export function TagPill({ name, color, aiGenerated = false }: TagPillProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {aiGenerated && <AiSuggestedBadge compact />}
      {name}
    </span>
  )
}

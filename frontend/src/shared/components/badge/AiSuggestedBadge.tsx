import { Tooltip } from '@mantine/core'
import { Sparkles } from 'lucide-react'

const AI_SUGGESTED_LABEL = 'Sugerido por IA'

export function AiSuggestedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Tooltip label={AI_SUGGESTED_LABEL} withArrow position="top">
        <span role="img" aria-label={AI_SUGGESTED_LABEL} className="inline-flex shrink-0">
          <Sparkles size={12} aria-hidden="true" />
        </span>
      </Tooltip>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
      <Sparkles size={12} aria-hidden="true" />
      {AI_SUGGESTED_LABEL}
    </span>
  )
}

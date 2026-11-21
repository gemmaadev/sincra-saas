import { Tooltip } from '@mantine/core'
import { Sparkles } from 'lucide-react'

export const AI_SUGGESTED_LABEL = 'Sugerido por IA'

export function AiSuggestedMark() {
  return (
    <Tooltip label={AI_SUGGESTED_LABEL} withArrow position="top">
      <span role="img" aria-label={AI_SUGGESTED_LABEL} className="inline-flex shrink-0">
        <Sparkles size={12} aria-hidden="true" />
      </span>
    </Tooltip>
  )
}

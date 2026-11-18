import { TagPill } from '../tag-pill/TagPill'
import { AiSuggestedMark, AI_SUGGESTED_LABEL } from './AiSuggestedMark'

export const AI_SUGGESTED_TAG_COLOR = '#1e5eff'

export function AiSuggestedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) return <AiSuggestedMark />

  return <TagPill name={AI_SUGGESTED_LABEL} color={AI_SUGGESTED_TAG_COLOR} aiGenerated />
}

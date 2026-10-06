import { Sparkles } from 'lucide-react'

export function AiSuggestedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
      <Sparkles size={12} aria-hidden="true" />
      Sugerido por IA
    </span>
  )
}

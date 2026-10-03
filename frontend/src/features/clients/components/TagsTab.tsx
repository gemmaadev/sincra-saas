import { TagPill } from '@/shared/components'
import type { ClientDetail } from '../types/client.types'

interface TagsTabProps {
  client: ClientDetail
}

export function TagsTab({ client }: TagsTabProps) {
  if (client.clientTags.length === 0) {
    return <p className="text-sm text-ink-muted">Este cliente no tiene etiquetas todavía.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {client.clientTags.map(({ id, tag }) => (
        <TagPill key={id} name={tag.name} color={tag.color} />
      ))}
    </div>
  )
}

import { TagsTab } from '@/features/tags/components/TagsTab'
import { useAssignClientTag } from '../../hooks/useAssignClientTag'
import { useRemoveClientTag } from '../../hooks/useRemoveClientTag'
import type { ClientDetail } from '../../types/client.types'

interface ClientTagsTabProps {
  client: ClientDetail
}

export function ClientTagsTab({ client }: ClientTagsTabProps) {
  const assignTag = useAssignClientTag(client.id)
  const removeTag = useRemoveClientTag(client.id)

  return (
    <TagsTab
      assignedTags={client.clientTags}
      assignTag={assignTag}
      removeTag={removeTag}
      emptyMessage="Este cliente no tiene etiquetas todavía."
      ariaLabel="Etiquetas del cliente"
    />
  )
}

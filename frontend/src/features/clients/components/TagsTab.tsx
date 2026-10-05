import { X } from 'lucide-react'
import { TagPill, AiSuggestedBadge } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { TagPicker } from '@/features/tags/components/TagPicker'
import { useTags } from '@/features/tags/hooks/useTags'
import { useCreateTag } from '@/features/tags/hooks/useCreateTag'
import { pickTagColor } from '@/features/tags/utils/pickTagColor'
import type { Tag } from '@/features/tags/types/tag.types'
import { useAssignClientTag } from '../hooks/useAssignClientTag'
import { useRemoveClientTag } from '../hooks/useRemoveClientTag'
import type { ClientDetail } from '../types/client.types'

interface TagsTabProps {
  client: ClientDetail
}

export function TagsTab({ client }: TagsTabProps) {
  const { data: tags = [] } = useTags()
  const createTag = useCreateTag()
  const assignTag = useAssignClientTag(client.id)
  const removeTag = useRemoveClientTag(client.id)

  const assignedTagIds = new Set(client.clientTags.map((clientTag) => clientTag.tagId))
  const isBusy = createTag.isPending || assignTag.isPending || removeTag.isPending

  function resetErrors() {
    createTag.reset()
    assignTag.reset()
    removeTag.reset()
  }

  function handleSelect(tag: Tag) {
    resetErrors()
    assignTag.mutate(tag.id)
  }

  function handleCreate(name: string) {
    resetErrors()
    createTag.mutate(
      { name, color: pickTagColor(tags) },
      { onSuccess: (createdTag) => assignTag.mutate(createdTag.id) },
    )
  }

  function handleRemove(tagId: string) {
    resetErrors()
    removeTag.mutate(tagId)
  }

  const failure = createTag.error ?? assignTag.error ?? removeTag.error
  const errorMessage = failure
    ? failure instanceof ApiError
      ? failure.message
      : 'No se han podido actualizar las etiquetas. Inténtalo de nuevo.'
    : undefined

  return (
    <div className="flex flex-col gap-4">
      {client.clientTags.length === 0 ? (
        <p className="text-sm text-ink-muted">Este cliente no tiene etiquetas todavía.</p>
      ) : (
        <ul aria-label="Etiquetas del cliente" className="flex flex-wrap gap-3">
          {client.clientTags.map(({ id, tagId, aiGenerated, tag }) => (
            <li key={id} className="inline-flex items-center gap-1.5">
              <TagPill name={tag.name} color={tag.color} />
              {aiGenerated && <AiSuggestedBadge />}
              <button
                type="button"
                aria-label={`Quitar etiqueta ${tag.name}`}
                disabled={isBusy}
                onClick={() => handleRemove(tagId)}
                className="cursor-pointer rounded-full p-0.5 text-ink-muted transition-colors hover:bg-neutral-100 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <TagPicker
          tags={tags}
          assignedTagIds={assignedTagIds}
          onSelect={handleSelect}
          onCreate={handleCreate}
          isBusy={isBusy}
        />
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-error">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

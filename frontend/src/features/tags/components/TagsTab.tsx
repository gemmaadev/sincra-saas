import { X } from 'lucide-react'
import type { UseMutationResult } from '@tanstack/react-query'
import { TagPill, AiSuggestedBadge } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { TagPicker } from './TagPicker'
import { useTags } from '../hooks/useTags'
import { useCreateTag } from '../hooks/useCreateTag'
import { pickTagColor } from '../utils/pickTagColor'
import type { Tag } from '../types/tag.types'

export interface TagAssignment {
  id: string
  tagId: string
  aiGenerated: boolean
  tag: Tag
}

interface TagsTabProps {
  assignedTags: TagAssignment[]
  assignTag: UseMutationResult<unknown, unknown, string>
  removeTag: UseMutationResult<unknown, unknown, string>
  emptyMessage: string
  ariaLabel: string
}

export function TagsTab({ assignedTags, assignTag, removeTag, emptyMessage, ariaLabel }: TagsTabProps) {
  const { data: tags = [] } = useTags()
  const createTag = useCreateTag()

  const assignedTagIds = new Set(assignedTags.map((assignment) => assignment.tagId))
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
      {assignedTags.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyMessage}</p>
      ) : (
        <ul aria-label={ariaLabel} className="flex flex-wrap gap-3">
          {assignedTags.map(({ id, tagId, aiGenerated, tag }) => (
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

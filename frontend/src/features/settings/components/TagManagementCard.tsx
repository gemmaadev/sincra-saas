import { useState } from 'react'
import { Tags } from 'lucide-react'
import { ConfirmDeleteModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useTags } from '@/features/tags/hooks/useTags'
import { useUpdateTag } from '@/features/tags/hooks/useUpdateTag'
import { useDeleteTag } from '@/features/tags/hooks/useDeleteTag'
import type { Tag } from '@/features/tags/types/tag.types'
import { SectionHeader } from './SectionHeader'
import { TagRow } from './TagRow'

export function TagManagementCard() {
  const { data: tags = [] } = useTags()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)

  function handleCloseDeleteModal() {
    deleteTag.reset()
    setTagToDelete(null)
  }

  function handleConfirmDelete() {
    if (!tagToDelete) return

    deleteTag.mutate(tagToDelete.id, {
      onSuccess: () => {
        notifySuccess('Etiqueta eliminada')
        setTagToDelete(null)
      },
    })
  }

  const updateError = updateTag.isError
    ? updateTag.error instanceof ApiError
      ? updateTag.error.message
      : 'No se ha podido actualizar la etiqueta. Inténtalo de nuevo.'
    : undefined

  const deleteError = deleteTag.isError
    ? deleteTag.error instanceof ApiError
      ? deleteTag.error.message
      : 'No se ha podido eliminar la etiqueta. Inténtalo de nuevo.'
    : undefined

  return (
    <section aria-label="Etiquetas" className="flex flex-col gap-4 py-10 first:pt-0 last:pb-0">
      <SectionHeader
        icon={<Tags size={24} aria-hidden="true" />}
        title="Etiquetas"
        description="Gestiona las etiquetas que usa tu equipo para clasificar clientes y pedidos."
      />

      {tags.length === 0 ? (
        <p className="text-sm text-ink-muted">Todavía no hay etiquetas.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-100">
          {tags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              disabled={updateTag.isPending || deleteTag.isPending}
              onRename={(name) => updateTag.mutate({ id: tag.id, name })}
              onRecolor={(color) => updateTag.mutate({ id: tag.id, color })}
              onDeleteRequest={setTagToDelete}
            />
          ))}
        </ul>
      )}

      {updateError && (
        <p role="alert" className="text-sm text-error">
          {updateError}
        </p>
      )}

      {tagToDelete && (
        <ConfirmDeleteModal
          opened
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isLoading={deleteTag.isPending}
          error={deleteError}
          title={`¿Eliminar "${tagToDelete.name}"?`}
          message="Se quitará de todos los clientes y pedidos que la tengan asignada. Esta acción no se puede deshacer."
          confirmLabel="Eliminar etiqueta"
        />
      )}
    </section>
  )
}

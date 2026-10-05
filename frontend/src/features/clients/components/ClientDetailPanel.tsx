import { useState } from 'react'
import { Tabs, ConfirmDeleteModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useClientDetail } from '../hooks/useClientDetail'
import { useDeleteClient } from '../hooks/useDeleteClient'
import { ClientDetailHeader } from './ClientDetailHeader'
import { ClientFormModal } from './ClientFormModal'
import { SummaryTab } from './SummaryTab'
import { OrdersTab } from './OrdersTab'
import { NotesTab } from './NotesTab'
import { TagsTab } from './TagsTab'

interface ClientDetailPanelProps {
  id: string
  onDeleted: () => void
}

export function ClientDetailPanel({ id, onDeleted }: ClientDetailPanelProps) {
  const { data: client, isLoading, isError } = useClientDetail(id)
  const deleteClient = useDeleteClient(id)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  function closeDeleteModal() {
    deleteClient.reset()
    setIsDeleteModalOpen(false)
  }

  function handleDelete() {
    deleteClient.mutate(undefined, {
      onSuccess: () => {
        notifySuccess('Cliente eliminado')
        closeDeleteModal()
        onDeleted()
      },
    })
  }

  const deleteError = deleteClient.isError
    ? deleteClient.error instanceof ApiError
      ? deleteClient.error.message
      : 'No se ha podido eliminar el cliente. Inténtalo de nuevo.'
    : undefined

  if (isLoading) {
    return <p className="text-ink-muted">Cargando cliente...</p>
  }

  if (isError || !client) {
    return <p className="text-error">No se ha podido cargar el cliente.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <ClientDetailHeader
        client={client}
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={() => setIsDeleteModalOpen(true)}
      />
      <Tabs
        tabs={[
          { key: 'resumen', label: 'Resumen', content: <SummaryTab client={client} /> },
          { key: 'historial', label: 'Historial', content: null, disabled: true },
          { key: 'pedidos', label: 'Pedidos', content: <OrdersTab /> },
          { key: 'notas', label: 'Notas', content: <NotesTab clientId={client.id} /> },
          { key: 'etiquetas', label: 'Etiquetas', content: <TagsTab client={client} /> },
        ]}
      />
      <ClientFormModal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
      />
      <ConfirmDeleteModal
        opened={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isLoading={deleteClient.isPending}
        error={deleteError}
        title="¿Eliminar cliente?"
        message={`Vas a eliminar a ${client.name}. Se eliminarán también sus notas y etiquetas. Esta acción no se puede deshacer.`}
      />
    </div>
  )
}

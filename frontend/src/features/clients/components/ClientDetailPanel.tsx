import { useState } from 'react'
import { Tabs } from '@/shared/components'
import { useClientDetail } from '../hooks/useClientDetail'
import { ClientDetailHeader } from './ClientDetailHeader'
import { ClientFormModal } from './ClientFormModal'
import { DeleteClientModal } from './DeleteClientModal'
import { ClientSummaryTab } from './ClientSummaryTab'
import { ClientOrdersTab } from './ClientOrdersTab'
import { ClientNotesTab } from './ClientNotesTab'
import { ClientTagsTab } from './ClientTagsTab'

interface ClientDetailPanelProps {
  id: string
  onDeleted: () => void
}

export function ClientDetailPanel({ id, onDeleted }: ClientDetailPanelProps) {
  const { data: client, isLoading, isError } = useClientDetail(id)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

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
          { key: 'resumen', label: 'Resumen', content: <ClientSummaryTab client={client} /> },
          { key: 'historial', label: 'Historial', content: null, disabled: true },
          { key: 'pedidos', label: 'Pedidos', content: <ClientOrdersTab client={client} /> },
          { key: 'notas', label: 'Notas', content: <ClientNotesTab clientId={client.id} /> },
          { key: 'etiquetas', label: 'Etiquetas', content: <ClientTagsTab client={client} /> },
        ]}
      />
      <ClientFormModal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
      />
      <DeleteClientModal
        client={client}
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={onDeleted}
      />
    </div>
  )
}

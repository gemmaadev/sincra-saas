import { useState } from 'react'
import { Tabs } from '@/shared/components'
import { useClientDetail } from '../hooks/useClientDetail'
import { ClientDetailHeader } from './ClientDetailHeader'
import { ClientFormModal } from './ClientFormModal'
import { SummaryTab } from './SummaryTab'
import { OrdersTab } from './OrdersTab'
import { NotesTab } from './NotesTab'
import { TagsTab } from './TagsTab'

interface ClientDetailPanelProps {
  id: string
}

export function ClientDetailPanel({ id }: ClientDetailPanelProps) {
  const { data: client, isLoading, isError } = useClientDetail(id)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)

  if (isLoading) {
    return <p className="text-ink-muted">Cargando cliente...</p>
  }

  if (isError || !client) {
    return <p className="text-error">No se ha podido cargar el cliente.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <ClientDetailHeader client={client} onEdit={() => setIsEditModalOpen(true)} />
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
    </div>
  )
}

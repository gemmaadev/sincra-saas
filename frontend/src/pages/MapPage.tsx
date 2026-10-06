import { useState } from 'react'
import { ClientsMap } from '@/features/map/components/ClientsMap'
import { useClientsMap } from '@/features/map/hooks/useClientsMap'
import { EditClientModal } from '@/features/clients/components/EditClientModal'
import { DeleteClientModal } from '@/features/clients/components/DeleteClientModal'
import type { MapClient } from '@/features/map/types/map.types'

export default function MapPage() {
  const { data, isLoading, isError } = useClientsMap()
  const [clientToEdit, setClientToEdit] = useState<MapClient | null>(null)
  const [clientToDelete, setClientToDelete] = useState<MapClient | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">Mapa de clientes y pedidos</h1>
      {isLoading && <p className="text-ink-muted">Cargando mapa...</p>}
      {isError && <p className="text-error">No se ha podido cargar el mapa.</p>}
      {data && (
        <ClientsMap
          clients={data.clients}
          onEditClient={setClientToEdit}
          onDeleteClient={setClientToDelete}
        />
      )}

      {clientToEdit && (
        <EditClientModal clientId={clientToEdit.id} opened onClose={() => setClientToEdit(null)} />
      )}
      {clientToDelete && (
        <DeleteClientModal
          client={clientToDelete}
          opened
          onClose={() => setClientToDelete(null)}
          onDeleted={() => setClientToDelete(null)}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import type { LatLngTuple } from 'leaflet'
import { ApproximateClientsCard } from '@/features/map/components/ApproximateClientsCard'
import { ClientsMap } from '@/features/map/components/ClientsMap'
import { MapKpiCards } from '@/features/map/components/MapKpiCards'
import { MapLayerToggle } from '@/features/map/components/MapLayerToggle'
import { ZoneSummaryCard } from '@/features/map/components/ZoneSummaryCard'
import { useClientsMap } from '@/features/map/hooks/useClientsMap'
import { buildMapKpis } from '@/features/map/utils/buildMapKpis'
import { getZonePositions } from '@/features/map/utils/getZonePositions'
import { EditClientModal } from '@/features/clients/components/EditClientModal'
import { DeleteClientModal } from '@/features/clients/components/DeleteClientModal'
import type { MapClient } from '@/features/map/types/map.types'

export default function MapPage() {
  const { data, isLoading, isError } = useClientsMap()
  const [focusedPositions, setFocusedPositions] = useState<LatLngTuple[] | null>(null)
  const [clientToEdit, setClientToEdit] = useState<MapClient | null>(null)
  const [clientToDelete, setClientToDelete] = useState<MapClient | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">Mapa de clientes y pedidos</h1>
      {isLoading && <p className="text-ink-muted">Cargando mapa...</p>}
      {isError && <p className="text-error">No se ha podido cargar el mapa.</p>}
      {data && (
        <>
          <MapKpiCards kpis={buildMapKpis(data)} />
          <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <div className="relative">
              <ClientsMap
                clients={data.clients}
                focusedPositions={focusedPositions}
                onEditClient={setClientToEdit}
                onDeleteClient={setClientToDelete}
              />
              <div className="absolute right-3 top-3 z-10">
                <MapLayerToggle />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <ZoneSummaryCard
                zones={data.zones}
                onSelectZone={(zone) => setFocusedPositions(getZonePositions(data.clients, zone))}
              />
              <ApproximateClientsCard
                clients={data.clients.filter((client) => client.approximate)}
                onAddAddress={setClientToEdit}
              />
            </div>
          </div>
        </>
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

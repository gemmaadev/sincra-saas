import { useState } from 'react'
import { ApproximateClientsCard } from '@/features/map/components/ApproximateClientsCard'
import { ClientsMap } from '@/features/map/components/ClientsMap'
import { MapFilterBar } from '@/features/map/components/MapFilterBar'
import { MapKpiCards } from '@/features/map/components/MapKpiCards'
import { MapLayerToggle } from '@/features/map/components/MapLayerToggle'
import { PendingChartCard } from '@/features/map/components/PendingChartCard'
import { ZoneSummaryCard } from '@/features/map/components/ZoneSummaryCard'
import { useClientsMap } from '@/features/map/hooks/useClientsMap'
import { useMapFilters } from '@/features/map/hooks/useMapFilters'
import { useMapFocus } from '@/features/map/hooks/useMapFocus'
import { buildMapKpis } from '@/features/map/utils/buildMapKpis'
import { ClientFormModal } from '@/features/clients/components/ClientFormModal'
import { EditClientModal } from '@/features/clients/components/EditClientModal'
import { DeleteClientModal } from '@/features/clients/components/DeleteClientModal'
import type { Coordinates } from '@/features/clients/types/client.types'
import type { MapClient, MapLayer } from '@/features/map/types/map.types'

export default function MapPage() {
  const mapFilters = useMapFilters()
  const { data, isLoading, isError, isPlaceholderData } = useClientsMap(mapFilters.filters)
  const { focusedPositions, focusZone } = useMapFocus(
    data?.clients,
    JSON.stringify(mapFilters.filters),
    isPlaceholderData,
  )
  const [layer, setLayer] = useState<MapLayer>('clients')
  const [newClientLocation, setNewClientLocation] = useState<Coordinates | null>(null)
  const [clientToEdit, setClientToEdit] = useState<MapClient | null>(null)
  const [clientToDelete, setClientToDelete] = useState<MapClient | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-ink">Mapa de clientes y pedidos</h1>
        <p className="text-ink">
          Visualiza dónde están tus clientes, qué zonas funcionan mejor y cuáles potenciar.
        </p>
      </div>
      {data && <MapKpiCards kpis={buildMapKpis(data)} />}
      <MapFilterBar
        channel={mapFilters.channel}
        from={mapFilters.from}
        to={mapFilters.to}
        isDateRangeInvalid={mapFilters.isDateRangeInvalid}
        hasActiveFilters={mapFilters.hasActiveFilters}
        onChannelChange={mapFilters.setChannel}
        onFromChange={mapFilters.setFrom}
        onToChange={mapFilters.setTo}
        onClear={mapFilters.clearFilters}
      />
      {isLoading && <p className="text-ink-muted">Cargando mapa...</p>}
      {isError && <p className="text-error">No se ha podido cargar el mapa.</p>}
      {data && (
        <>
          <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <div className="relative h-144">
              <ClientsMap
                clients={data.clients}
                focusedPositions={focusedPositions}
                onEditClient={setClientToEdit}
                onDeleteClient={setClientToDelete}
                onCreateClientAt={setNewClientLocation}
              />
              {data.clients.length === 0 && (
                <p className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-4 py-2 text-sm text-ink-muted shadow-md">
                  Todavía no tienes clientes con ubicación en el mapa.
                </p>
              )}
              <div className="absolute right-3 top-3 z-10">
                <MapLayerToggle layer={layer} onLayerChange={setLayer} />
              </div>
            </div>
            <div className="flex flex-col gap-4 lg:h-144">
              <div className="shrink-0">
                <ZoneSummaryCard zones={data.zones} onSelectZone={focusZone} />
              </div>
              <ApproximateClientsCard
                className="min-h-0 flex-1"
                clients={data.clients.filter((client) => client.approximate)}
                onAddAddress={setClientToEdit}
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <PendingChartCard title="Ingresos por zona" />
            <PendingChartCard title="Ticket medio por zona" />
          </div>
        </>
      )}

      {newClientLocation && (
        <ClientFormModal
          opened
          initialLocation={newClientLocation}
          onClose={() => setNewClientLocation(null)}
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

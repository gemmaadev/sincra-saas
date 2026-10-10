import { useState } from 'react'
import { ApproximateClientsCard } from '@/features/map/components/ApproximateClientsCard'
import { ClientsMap } from '@/features/map/components/ClientsMap'
import { MapFilterBar } from '@/features/map/components/MapFilterBar'
import { MapLayerToggle } from '@/features/map/components/MapLayerToggle'
import { ZoneBarChart } from '@/features/map/components/ZoneBarChart'
import { ZoneSummaryCard } from '@/features/map/components/ZoneSummaryCard'
import { useClientsMap } from '@/features/map/hooks/useClientsMap'
import { useOrdersMap } from '@/features/map/hooks/useOrdersMap'
import { useMapFilters } from '@/features/map/hooks/useMapFilters'
import { useMapFocus } from '@/features/map/hooks/useMapFocus'
import { buildClientMapKpis, toClientKpiCards } from '@/features/map/utils/buildClientMapKpis'
import { buildOrderMapKpis, toOrderKpiCards } from '@/features/map/utils/buildOrderMapKpis'
import { buildRevenueByZone, buildAverageTicketByZone } from '@/features/map/utils/buildZoneChartData'
import { ClientFormModal } from '@/features/clients/components/ClientFormModal'
import { EditClientModal } from '@/features/clients/components/EditClientModal'
import { DeleteClientModal } from '@/features/clients/components/DeleteClientModal'
import { EditOrderModal } from '@/features/orders/components/EditOrderModal'
import { KpiCardsRow } from '@/shared/components'
import type { Coordinates } from '@/features/clients/types/client.types'
import type { MapClient, MapLayer, MapOrder } from '@/features/map/types/map.types'

export default function MapPage() {
  const mapFilters = useMapFilters()
  const [layer, setLayer] = useState<MapLayer>('clients')
  const { data, isLoading, isError, isPlaceholderData } = useClientsMap(mapFilters.filters)
  const { data: ordersMapData } = useOrdersMap(mapFilters.filters)
  const { focusedPositions, focusZone } = useMapFocus(
    data?.clients,
    JSON.stringify(mapFilters.filters),
    isPlaceholderData,
  )
  const [newClientLocation, setNewClientLocation] = useState<Coordinates | null>(null)
  const [clientToEdit, setClientToEdit] = useState<MapClient | null>(null)
  const [clientToDelete, setClientToDelete] = useState<MapClient | null>(null)
  const [orderToEdit, setOrderToEdit] = useState<MapOrder | null>(null)

  const isMapEmpty =
    layer === 'clients' ? data?.clients.length === 0 : (ordersMapData?.orders.length ?? 0) === 0
  const emptyMapMessage =
    layer === 'clients'
      ? 'Todavía no tienes clientes con ubicación en el mapa.'
      : 'Todavía no tienes pedidos con ubicación en el mapa.'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-ink">Mapa de clientes y pedidos</h1>
        <p className="text-ink">
          Visualiza dónde están tus clientes, qué zonas funcionan mejor y cuáles potenciar.
        </p>
      </div>
      <KpiCardsRow
        cards={
          layer === 'clients'
            ? toClientKpiCards(data ? buildClientMapKpis(data) : null)
            : toOrderKpiCards(ordersMapData ? buildOrderMapKpis(ordersMapData) : null)
        }
      />
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
                layer={layer}
                clients={data.clients}
                orders={ordersMapData?.orders ?? []}
                focusedPositions={focusedPositions}
                onEditClient={setClientToEdit}
                onDeleteClient={setClientToDelete}
                onCreateClientAt={setNewClientLocation}
                onEditOrder={setOrderToEdit}
              />
              {isMapEmpty && (
                <p className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-4 py-2 text-sm text-ink-muted shadow-md">
                  {emptyMapMessage}
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
          {ordersMapData && (
            <div className="grid gap-4 lg:grid-cols-2">
              <ZoneBarChart title="Ingresos por zona" data={buildRevenueByZone(ordersMapData.zones)} />
              <ZoneBarChart
                title="Ticket medio por zona"
                data={buildAverageTicketByZone(ordersMapData.zones)}
              />
            </div>
          )}
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
      {orderToEdit && (
        <EditOrderModal orderId={orderToEdit.id} opened onClose={() => setOrderToEdit(null)} />
      )}
    </div>
  )
}

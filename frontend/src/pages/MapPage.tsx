import { ClientsMap } from '@/features/map/components/ClientsMap'
import { useClientsMap } from '@/features/map/hooks/useClientsMap'

export default function MapPage() {
  const { data, isLoading, isError } = useClientsMap()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">Mapa de clientes y pedidos</h1>
      {isLoading && <p className="text-ink-muted">Cargando mapa...</p>}
      {isError && <p className="text-error">No se ha podido cargar el mapa.</p>}
      {data && <ClientsMap clients={data.clients} />}
    </div>
  )
}

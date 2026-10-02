import { useClientDetail } from '../hooks/useClientDetail'

interface ClientDetailPanelProps {
  id: string
}

export function ClientDetailPanel({ id }: ClientDetailPanelProps) {
  const { data: client, isLoading, isError } = useClientDetail(id)

  if (isLoading) {
    return <p className="text-ink-muted">Cargando cliente...</p>
  }

  if (isError || !client) {
    return <p className="text-error">No se ha podido cargar el cliente.</p>
  }

  return <p className="font-medium text-ink">{client.name}</p>
}

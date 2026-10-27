import { Card } from '@/shared/components'
import type { MapClient } from '../types/map.types'

interface ApproximateClientsCardProps {
  clients: MapClient[]
  onAddAddress: (client: MapClient) => void
  className?: string
}

export function ApproximateClientsCard({
  clients,
  onAddAddress,
  className = '',
}: ApproximateClientsCardProps) {
  return (
    <Card className={`flex flex-col gap-3 ${className}`}>
      <h2 className="font-semibold text-ink">Sin ubicación exacta</h2>

      {clients.length === 0 ? (
        <p className="text-sm text-ink-muted">Todos tus clientes tienen ubicación exacta.</p>
      ) : (
        <>
          <p className="text-xs text-ink-muted">Añade su dirección para situarlos mejor.</p>
          <ul className="flex min-h-0 max-h-56 flex-1 flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] lg:max-h-none">
            {clients.map((client) => (
              <li key={client.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-ink">{client.name}</span>
                  {client.zone && <span className="truncate text-ink-muted">{client.zone}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => onAddAddress(client)}
                  className="shrink-0 cursor-pointer font-medium text-primary hover:underline"
                >
                  Añadir dirección
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}

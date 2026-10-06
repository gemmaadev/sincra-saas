import { Card } from '@/shared/components'
import { formatDate } from '@/shared/utils/date'
import type { ClientDetail } from '../types/client.types'

interface SummaryTabProps {
  client: ClientDetail
}

export function SummaryTab({ client }: SummaryTabProps) {
  const location = [client.address, client.zone].filter(Boolean).join(', ')

  return (
    <div className="flex flex-col gap-4">
      <Card padding="md" className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-muted">Cliente desde</span>
          <span className="font-medium text-ink">{formatDate(new Date(client.createdAt))}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-muted">Ubicación</span>
          <span className="font-medium text-ink">{location || '—'}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-muted">Total de pedidos</span>
          <span className="text-ink-muted" title="Disponible cuando exista el módulo de pedidos">
            —
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-muted">Valor total</span>
          <span className="text-ink-muted" title="Disponible cuando exista el módulo de pedidos">
            —
          </span>
        </div>
      </Card>

      <Card padding="md" className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Pedidos recientes</span>
        <p className="text-sm text-ink-muted">Disponible cuando exista el módulo de pedidos</p>
      </Card>

      <Card padding="md" className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Últimas conversaciones</span>
        <p className="text-sm text-ink-muted">Esta función no está disponible todavía</p>
      </Card>
    </div>
  )
}

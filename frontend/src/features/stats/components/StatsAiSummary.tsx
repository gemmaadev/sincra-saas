import { Sparkles, Users, ShoppingCart } from 'lucide-react'
import { Card } from '@/shared/components'
import type { AiSummary } from '../types/stats.types'

interface StatsAiSummaryProps {
  summary: AiSummary | null
}

export function StatsAiSummary({ summary }: StatsAiSummaryProps) {
  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary" aria-hidden="true" />
          <h2 className="font-semibold text-ink">Resumen de la IA</h2>
        </div>
        <p className="text-sm text-ink-muted">
          Clientes y pedidos que la agente Sincra detectó en tus comunicaciones y el agente Sincro
          guardó automáticamente.
        </p>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-ink-muted" aria-hidden="true" />
          <span className="text-sm text-ink">
            <strong className="text-base font-semibold text-ink">
              {summary?.clientsDetected ?? '—'}
            </strong>{' '}
            clientes detectados
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-ink-muted" aria-hidden="true" />
          <span className="text-sm text-ink">
            <strong className="text-base font-semibold text-ink">
              {summary?.ordersDetected ?? '—'}
            </strong>{' '}
            pedidos detectados
          </span>
        </div>
      </div>
    </Card>
  )
}

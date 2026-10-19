import { Sparkles } from 'lucide-react'
import { AgentCard } from '@/features/automations/components/AgentCard'
import { AgentFlowBanner } from '@/features/automations/components/AgentFlowBanner'
import { AI_AGENTS } from '@/features/automations/automations.constants'

export default function AutomationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Agentes IA</h1>
        <p className="text-sm text-ink-muted">
          Sincra revisa tus mensajes y detecta clientes y pedidos nuevos; Sincro los deja
          organizados para que tú decidas qué hacer con ellos.
        </p>
      </div>

      <AgentFlowBanner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {AI_AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      <div className="flex items-start gap-3">
        <Sparkles size={20} className="shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm text-ink-muted">
          Todo lo que crean estos agentes se marca como{' '}
          <strong className="text-ink">"Sugerido por IA"</strong> en clientes y pedidos, para que
          siempre puedas distinguirlo de lo que has creado tú mismo/a.
        </p>
      </div>
    </div>
  )
}
